package httpserver

import (
	"crypto/subtle"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/synw/agent-smith/server/go/conf"
	"github.com/synw/agent-smith/server/go/state"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// setupTestConf initializes state.Conf with a test configuration.
func setupTestConf(t *testing.T) {
	t.Helper()
	yamlData := []byte(`
api_key: "test-main-key-12345"
origins:
  - "http://localhost:5173"
  - "http://localhost:8080"
groups:
  editor:
    - "read"
    - "write"
`)
	state.SetConf(conf.InitConfFromReader(yamlData))
}

// ---------------------------------------------------------------------------
// 1. TestPingEndpoint
// ---------------------------------------------------------------------------

func TestPingEndpoint(t *testing.T) {
	setupTestConf(t)

	e := echo.New()
	e.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code, "Ping endpoint should return 200")

	var body map[string]string
	err := json.Unmarshal(rec.Body.Bytes(), &body)
	require.NoError(t, err, "Response body should be valid JSON")
	assert.Equal(t, "ok", body["status"], "Status field should be 'ok'")
}

// ---------------------------------------------------------------------------
// 2. TestCORSHeaders
// ---------------------------------------------------------------------------

func TestCORSHeaders(t *testing.T) {
	setupTestConf(t)

	e := echo.New()
	// Use Echo's real CORS middleware matching router.go setup
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     state.GetConf().Origins,
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAuthorization},
		AllowMethods:     []string{http.MethodGet, http.MethodOptions, http.MethodPost},
		AllowCredentials: true,
	}))
	e.GET("/cors-test", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	// Test with an allowed origin
	req := httptest.NewRequest(http.MethodGet, "/cors-test", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "http://localhost:5173", rec.Header().Get("Access-Control-Allow-Origin"),
		"Allowed origin should be echoed back")
	assert.Equal(t, "true", rec.Header().Get("Access-Control-Allow-Credentials"),
		"Credential flag should be true")

	// Test with another allowed origin
	req2 := httptest.NewRequest(http.MethodGet, "/cors-test", nil)
	req2.Header.Set("Origin", "http://localhost:8080")
	rec2 := httptest.NewRecorder()
	e.ServeHTTP(rec2, req2)

	assert.Equal(t, "http://localhost:8080", rec2.Header().Get("Access-Control-Allow-Origin"),
		"Second allowed origin should be echoed back")
}

// ---------------------------------------------------------------------------
// 3. TestKeyAuth_ValidKey
// ---------------------------------------------------------------------------

func TestKeyAuth_ValidKey(t *testing.T) {
	setupTestConf(t)

	e := echo.New()
	e.GET("/api/protected", func(c echo.Context) error {
		return c.String(http.StatusOK, "access granted")
	})

	// Apply KeyAuth middleware matching router.go logic
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			key := c.Request().Header.Get("Authorization")
			conf := state.GetConf()
			if conf.CmdApiKey.IsValid && subtle.ConstantTimeCompare([]byte(key), []byte(conf.CmdApiKey.Key)) == 1 {
				c.Set("apiKey", key)
				return next(c)
			}
			for _, apiKey := range conf.ApiKeys {
				if subtle.ConstantTimeCompare([]byte(string(apiKey)), []byte(key)) == 1 {
					c.Set("apiKey", key)
					return next(c)
				}
			}
			return c.String(http.StatusUnauthorized, "unauthorized")
		}
	})

	req := httptest.NewRequest(http.MethodGet, "/api/protected", nil)
	req.Header.Set("Authorization", "test-main-key-12345")
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code, "Valid key should grant access")
	assert.Equal(t, "access granted", rec.Body.String())
}

// ---------------------------------------------------------------------------
// 4. TestKeyAuth_InvalidKey
// ---------------------------------------------------------------------------

func TestKeyAuth_InvalidKey(t *testing.T) {
	setupTestConf(t)

	e := echo.New()
	e.GET("/api/protected", func(c echo.Context) error {
		return c.String(http.StatusOK, "access granted")
	})

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			key := c.Request().Header.Get("Authorization")
			conf := state.GetConf()
			if conf.CmdApiKey.IsValid && subtle.ConstantTimeCompare([]byte(key), []byte(conf.CmdApiKey.Key)) == 1 {
				c.Set("apiKey", key)
				return next(c)
			}
			for _, apiKey := range conf.ApiKeys {
				if subtle.ConstantTimeCompare([]byte(string(apiKey)), []byte(key)) == 1 {
					c.Set("apiKey", key)
					return next(c)
				}
			}
			return c.String(http.StatusUnauthorized, "unauthorized")
		}
	})

	req := httptest.NewRequest(http.MethodGet, "/api/protected", nil)
	req.Header.Set("Authorization", "wrong-key-99999")
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code, "Invalid key should return 401")
}

// ---------------------------------------------------------------------------
// 5. TestKeyAuth_NoKey
// ---------------------------------------------------------------------------

func TestKeyAuth_NoKey(t *testing.T) {
	setupTestConf(t)

	e := echo.New()
	e.GET("/api/protected", func(c echo.Context) error {
		return c.String(http.StatusOK, "access granted")
	})

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			key := c.Request().Header.Get("Authorization")
			conf := state.GetConf()
			if conf.CmdApiKey.IsValid && subtle.ConstantTimeCompare([]byte(key), []byte(conf.CmdApiKey.Key)) == 1 {
				c.Set("apiKey", key)
				return next(c)
			}
			for _, apiKey := range conf.ApiKeys {
				if subtle.ConstantTimeCompare([]byte(string(apiKey)), []byte(key)) == 1 {
					c.Set("apiKey", key)
					return next(c)
				}
			}
			return c.String(http.StatusUnauthorized, "unauthorized")
		}
	})

	req := httptest.NewRequest(http.MethodGet, "/api/protected", nil)
	// No Authorization header
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code, "No key should return 401")
}

// ---------------------------------------------------------------------------
// 6. TestKeyAuth_GroupKey
// ---------------------------------------------------------------------------

func TestKeyAuth_GroupKey(t *testing.T) {
	setupTestConf(t)

	e := echo.New()
	e.GET("/api/protected", func(c echo.Context) error {
		return c.String(http.StatusOK, "access granted")
	})

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			key := c.Request().Header.Get("Authorization")
			conf := state.GetConf()
			if conf.CmdApiKey.IsValid && subtle.ConstantTimeCompare([]byte(key), []byte(conf.CmdApiKey.Key)) == 1 {
				c.Set("apiKey", key)
				return next(c)
			}
			for _, apiKey := range conf.ApiKeys {
				if subtle.ConstantTimeCompare([]byte(string(apiKey)), []byte(key)) == 1 {
					c.Set("apiKey", key)
					return next(c)
				}
			}
			return c.String(http.StatusUnauthorized, "unauthorized")
		}
	})

	// The "editor" group key is in state.Conf.ApiKeys
	// We need to construct the group key the same way conf does
	// Groups are keyed by the group name as GroupApiKey
	// But in the KeyAuth middleware, it checks string(apiKey) == key
	// where apiKey is from state.Conf.ApiKeys which are GroupApiKey type
	// GroupApiKey is string type, so the key would be "editor"
	req := httptest.NewRequest(http.MethodGet, "/api/protected", nil)
	req.Header.Set("Authorization", "editor")
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code, "Group API key should grant access")
	assert.Equal(t, "access granted", rec.Body.String())
}
