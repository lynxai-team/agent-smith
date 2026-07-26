package conf

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"

	"github.com/synw/agent-smith/server/types"

	"github.com/spf13/viper"
	"gopkg.in/yaml.v3"
)

func InitConf() types.Conf {
	viper.SetConfigName("server.config")
	viper.AddConfigPath(".")
	viper.SetDefault("origins", []string{"localhost"})
	viper.SetDefault("groups", []string{})
	viper.SetDefault("api_key", nil)
	err := viper.ReadInConfig() // Find and read the config file
	if err != nil {             // Handle errors reading the config file
		panic(fmt.Errorf("fatal error config file: %w", err))
	}
	or := viper.GetStringSlice("origins")
	cmdak := viper.GetString("api_key")
	apiKeyIsValid := cmdak != ""
	// Read groups from config
	groups := make(map[types.GroupApiKey]types.AuthorizedCmds)
	groupsData := viper.GetStringMap("groups")
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
