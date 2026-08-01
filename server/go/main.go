package main

import (
	"flag"
	"fmt"

	"github.com/synw/agent-smith/server/go/conf"
	"github.com/synw/agent-smith/server/go/httpserver"
	"github.com/synw/agent-smith/server/go/state"
)

func main() {
	quiet := flag.Bool("q", false, "disable the verbose output")
	debug := flag.Bool("debug", false, "debug mode")
	genconf := flag.Bool("conf", false, "generate a config file")
	genkey := flag.Bool("key", false, "generate a random api key")
	port := flag.Int("port", 5187, "server port")
	flag.Parse()

	if *genconf {
		conf.Create()
		fmt.Println("File server.config.yaml created")
		return
	}

	if *genkey {
		key := conf.GenerateRandomKey()
		fmt.Println(key)
		return
	}

	if *debug {
		fmt.Println("Debug mode is on")
		state.IsDebug = true
	}

	state.IsVerbose = !*quiet
	state.Conf = conf.InitConf()

	if state.IsVerbose {
		fmt.Println("Starting the WebSocket server with allowed origins", state.Conf.Origins)
	}

	httpserver.RunServer(*port)
}
