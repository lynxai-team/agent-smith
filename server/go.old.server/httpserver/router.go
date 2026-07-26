package httpserver

import (
	"net/http"
	"slices"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	"github.com/synw/agent-smith/server/state"
	"github.com/synw/agent-smith/server/types"
)

func RunServer() {
	e := echo.New()

	// logger
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${method} ${status} ${uri} ${latency_human} ${remote_ip} ${error}\n",
	}))
	if l, ok := e.Logger.(*log.Logger); ok {
		l.SetHeader("[${time_rfc3339}] ${level}")
	}

	//cors
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     state.Conf.Origins,
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAuthorization},
		AllowMethods:     []string{http.MethodGet, http.MethodOptions, http.MethodPost},
		AllowCredentials: true,
	}))

	cmds := e.Group("/cmd")
	cmds.Use(middleware.KeyAuth(func(key string, c echo.Context) (bool, error) {
		if state.Conf.CmdApiKey.IsValid {
			if key == state.Conf.CmdApiKey.Key {
				c.Set("apiKey", key)
				return true, nil
			}
		}
		if slices.Contains(state.Conf.ApiKeys, types.GroupApiKey(key)) {
			c.Set("apiKey", key)
			return true, nil
		}
		return false, nil
	}))
	//tasks.GET("/abort", AbortHandler)
	cmds.POST("/execute", ExecuteCmdHandler)

	e.Start(":5042")
}
