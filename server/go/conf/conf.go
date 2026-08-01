package conf

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"

	"github.com/synw/agent-smith/server/go/types"

	"github.com/spf13/viper"
	"gopkg.in/yaml.v3"
)

// InitConf loads configuration from the default server.config.yaml file.
// Panics if the config file cannot be read.
func InitConf() types.Conf {
	v := viper.New()
	v.SetConfigName("server.config")
	v.AddConfigPath(".")
	return parseViperConfig(v)
}

// InitConfFromReader loads configuration from a YAML reader (e.g., for testing).
// Accepts any io.Reader that provides YAML-formatted config data.
func InitConfFromReader(yamlData []byte) types.Conf {
	v := viper.New()
	v.SetConfigType("yaml")
	if err := v.ReadConfig(bytes.NewReader(yamlData)); err != nil {
		panic(fmt.Errorf("fatal error parsing config: %w", err))
	}
	return parseViperConfig(v)
}

// parseViperConfig extracts configuration from a viper instance.
func parseViperConfig(v *viper.Viper) types.Conf {
	v.SetDefault("origins", []string{"localhost"})
	v.SetDefault("groups", []string{})
	v.SetDefault("api_key", nil)

	or := v.GetStringSlice("origins")
	cmdak := v.GetString("api_key")
	apiKeyIsValid := cmdak != ""

	// Read groups from config
	groups := make(map[types.GroupApiKey]types.AuthorizedCmds)
	groupsData := v.GetStringMap("groups")
	apiKeys := []types.GroupApiKey{}
	for key, value := range groupsData {
		// Safely handle potential type assertion issues
		cmdSlice, ok := value.([]interface{})
		if !ok {
			// Skip invalid group entries instead of panicking
			continue
		}
		authorizedCmds := make([]string, len(cmdSlice))
		for i, cmd := range cmdSlice {
			// Ensure cmd is a string before type assertion
			if cmdStr, ok := cmd.(string); ok {
				authorizedCmds[i] = cmdStr
			}
		}
		groups[types.GroupApiKey(key)] = authorizedCmds
		apiKeys = append(apiKeys, types.GroupApiKey(key))
	}

	return types.Conf{
		Origins: or,
		CmdApiKey: types.ValidApiKey{
			Key:     cmdak,
			IsValid: apiKeyIsValid,
		},
		Groups:  groups,
		ApiKeys: apiKeys,
	}
}

// Create : create a config file
func Create() {
	// Check if the file already exists
	if _, err := os.Stat("server.config.yaml"); err == nil {
		fmt.Println("Config file already exists. Skipping creation.")
		return
	}
	key := GenerateRandomKey()
	data := map[string]interface{}{
		"origins": []string{"http://localhost:5173", "http://localhost:5143", "http://localhost:4321"},
		"api_key": key,
	}
	yamlString, _ := yaml.Marshal(data)
	os.WriteFile("server.config.yaml", yamlString, 0600)
}

func GenerateRandomKey() string {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		panic(err.Error())
	}
	key := hex.EncodeToString(bytes)
	return key
}
