package httpserver

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	"github.com/synw/agent-smith/server/go/state"
)

// RunServer starts the Echo HTTP server with WebSocket and health endpoints.
func RunServer(port int) {
	conf := state.GetConf()

	e := echo.New()

	// logger
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${method} ${status} ${uri} ${latency_human} ${remote_ip} ${error}\n",
	}))
	if l, ok := e.Logger.(*log.Logger); ok {
		l.SetHeader("[${time_rfc3339}] ${level}")
	}

	// CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     conf.Origins,
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAuthorization},
		AllowMethods:     []string{http.MethodGet, http.MethodOptions, http.MethodPost},
		AllowCredentials: true,
	}))

	// WebSocket route — no API key auth at HTTP level
	e.GET("/ws", WsHandler)

	// Health check
	e.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// Optional /api group with KeyAuth middleware for future REST endpoints
	cmds := e.Group("/api")
	cmds.Use(middleware.KeyAuth(func(key string, c echo.Context) (bool, error) {
		conf := state.GetConf()
		if conf.CmdApiKey.IsValid {
			if key == conf.CmdApiKey.Key {
				c.Set("apiKey", key)
				return true, nil
			}
		}
		for _, apiKey := range conf.ApiKeys {
			if string(apiKey) == key {
				c.Set("apiKey", key)
				return true, nil
			}
		}
		return false, nil
	}))
	// Future REST endpoints can be added here

	if state.IsVerbose.Load() {
		fmt.Printf("Starting the WebSocket server on port %d with allowed origins %v\n", port, conf.Origins)
	}

	e.Start(fmt.Sprintf(":%d", port))
}
