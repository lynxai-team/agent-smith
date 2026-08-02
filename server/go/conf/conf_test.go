package conf

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/synw/agent-smith/server/go/types"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// ---------------------------------------------------------------------------
// 1. TestGenerateRandomKey
// ---------------------------------------------------------------------------

func TestGenerateRandomKey(t *testing.T) {
	t.Parallel()

	key := GenerateRandomKey()

	// Verify length: 32 bytes → 64 hex characters
	assert.Len(t, key, 64, "Generated key should be 64 hex characters")

	// Verify all characters are valid hex
	for _, ch := range key {
		assert.True(t,
			(ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'f'),
			"Key character '%c' is not a valid lowercase hex character", ch)
	}

	// Verify uniqueness across multiple calls
	keys := make(map[string]bool)
	const iterations = 50
	for i := 0; i < iterations; i++ {
		k := GenerateRandomKey()
		assert.False(t, keys[k], "Key %d should be unique", i)
		keys[k] = true
	}
	assert.Len(t, keys, iterations, "All %d generated keys should be unique", iterations)
}

// ---------------------------------------------------------------------------
// 2. TestInitConfFromReader_ValidConfig
// ---------------------------------------------------------------------------

func TestInitConfFromReader_ValidConfig(t *testing.T) {
	t.Parallel()

	yamlData := []byte(`
api_key: "test-api-key-12345"
origins:
  - "http://localhost:5173"
  - "http://localhost:8080"
groups:
  admin:
    - "read"
    - "write"
    - "delete"
  editor:
    - "read"
    - "write"
`)

	conf := InitConfFromReader(yamlData)

	// Verify api_key
	assert.True(t, conf.CmdApiKey.IsValid, "API key should be valid when non-empty")
	assert.Equal(t, "test-api-key-12345", conf.CmdApiKey.Key, "API key value mismatch")

	// Verify origins
	assert.ElementsMatch(t, []string{"http://localhost:5173", "http://localhost:8080"}, conf.Origins)

	// Verify groups
	require.Contains(t, conf.Groups, types.GroupApiKey("admin"), "Should contain 'admin' group")
	assert.ElementsMatch(t, []string{"read", "write", "delete"}, conf.Groups[types.GroupApiKey("admin")])

	require.Contains(t, conf.Groups, types.GroupApiKey("editor"), "Should contain 'editor' group")
	assert.ElementsMatch(t, []string{"read", "write"}, conf.Groups[types.GroupApiKey("editor")])

	// Verify ApiKeys slice contains both group keys
	assert.Len(t, conf.ApiKeys, 2, "Should have 2 API key entries")
	assert.Contains(t, conf.ApiKeys, types.GroupApiKey("admin"))
	assert.Contains(t, conf.ApiKeys, types.GroupApiKey("editor"))
}

// ---------------------------------------------------------------------------
// 3. TestInitConfFromReader_EmptyApiKey
// ---------------------------------------------------------------------------

func TestInitConfFromReader_EmptyApiKey(t *testing.T) {
	t.Parallel()

	yamlData := []byte(`
api_key: ""
origins:
  - "http://localhost:3000"
`)

	conf := InitConfFromReader(yamlData)

	// Empty api_key should result in IsValid == false
	assert.False(t, conf.CmdApiKey.IsValid, "Empty API key should have IsValid == false")
	assert.Empty(t, conf.CmdApiKey.Key, "API key should be empty string")

	// Origins should still be parsed correctly
	assert.ElementsMatch(t, []string{"http://localhost:3000"}, conf.Origins)
}

// ---------------------------------------------------------------------------
// 4. TestInitConfFromReader_WithGroups
// ---------------------------------------------------------------------------

func TestInitConfFromReader_WithGroups(t *testing.T) {
	t.Parallel()

	yamlData := []byte(`
groups:
  deploy:
    - "deploy"
    - "rollback"
  monitor:
    - "status"
    - "logs"
  readonly:
    - "read"
`)

	conf := InitConfFromReader(yamlData)

	// Verify all three groups exist
	require.Len(t, conf.Groups, 3, "Should have exactly 3 groups")

	require.Contains(t, conf.Groups, types.GroupApiKey("deploy"))
	assert.ElementsMatch(t, []string{"deploy", "rollback"}, conf.Groups[types.GroupApiKey("deploy")])

	require.Contains(t, conf.Groups, types.GroupApiKey("monitor"))
	assert.ElementsMatch(t, []string{"status", "logs"}, conf.Groups[types.GroupApiKey("monitor")])

	require.Contains(t, conf.Groups, types.GroupApiKey("readonly"))
	assert.ElementsMatch(t, []string{"read"}, conf.Groups[types.GroupApiKey("readonly")])

	// Verify ApiKeys slice
	assert.Len(t, conf.ApiKeys, 3)
	assert.Contains(t, conf.ApiKeys, types.GroupApiKey("deploy"))
	assert.Contains(t, conf.ApiKeys, types.GroupApiKey("monitor"))
	assert.Contains(t, conf.ApiKeys, types.GroupApiKey("readonly"))
}

// ---------------------------------------------------------------------------
// 5. TestInitConfFromReader_DefaultOrigins
// ---------------------------------------------------------------------------

func TestInitConfFromReader_DefaultOrigins(t *testing.T) {
	t.Parallel()

	// YAML without origins field — should default to ["localhost"]
	yamlData := []byte(`
api_key: "some-key"
`)

	conf := InitConfFromReader(yamlData)

	assert.ElementsMatch(t, []string{"localhost"}, conf.Origins,
		"Missing origins should default to [\"localhost\"]")
}

// ---------------------------------------------------------------------------
// 6. TestInitConfFromReader_InvalidGroupEntry
// ---------------------------------------------------------------------------

func TestInitConfFromReader_InvalidGroupEntry(t *testing.T) {
	t.Parallel()

	// YAML with a group value that is not a slice — should be skipped gracefully
	yamlData := []byte(`
api_key: "test-key"
groups:
  valid_group:
    - "cmd1"
    - "cmd2"
  invalid_group: "not-a-slice"
`)

	// Should not panic — the function skips invalid entries
	conf := InitConfFromReader(yamlData)

	// Only the valid group should be present
	assert.Contains(t, conf.Groups, types.GroupApiKey("valid_group"), "Valid group should be present")
	assert.ElementsMatch(t, []string{"cmd1", "cmd2"}, conf.Groups[types.GroupApiKey("valid_group")])

	// The invalid group should be skipped (not present in map)
	assert.NotContains(t, conf.Groups, types.GroupApiKey("invalid_group"),
		"Invalid group entry should be skipped gracefully")

	// ApiKeys should only contain the valid one
	assert.Len(t, conf.ApiKeys, 1, "Only one valid API key entry expected")
	assert.Contains(t, conf.ApiKeys, types.GroupApiKey("valid_group"))
}

// ---------------------------------------------------------------------------
// 7. TestInitConfFromReader_MissingFields
// ---------------------------------------------------------------------------

func TestInitConfFromReader_MissingFields(t *testing.T) {
	t.Parallel()

	// Minimal YAML — no api_key, no origins, no groups
	yamlData := []byte(`
# Completely minimal config
`)

	conf := InitConfFromReader(yamlData)

	// Defaults should be applied
	assert.ElementsMatch(t, []string{"localhost"}, conf.Origins,
		"Missing origins should default to [\"localhost\"]")
	assert.False(t, conf.CmdApiKey.IsValid, "Missing api_key should result in IsValid == false")
	assert.Empty(t, conf.CmdApiKey.Key, "Missing api_key should result in empty Key")
	assert.Empty(t, conf.Groups, "Missing groups should default to empty map")
	assert.Empty(t, conf.ApiKeys, "Missing groups should default to empty ApiKeys slice")
}

// ---------------------------------------------------------------------------
// 8. TestInitConf_ValidConfig
// ---------------------------------------------------------------------------

func TestInitConf_ValidConfig(t *testing.T) {
	// NOTE: Not using t.Parallel() — this test modifies CWD via os.Chdir
	// which would interfere with other parallel tests sharing the same process.

	// Create a temporary directory and change into it
	tmpDir := t.TempDir()
	originalDir, err := os.Getwd()
	require.NoError(t, err, "Failed to get current working directory")
	require.NoError(t, os.Chdir(tmpDir), "Failed to chdir to temp dir")
	defer func() {
		require.NoError(t, os.Chdir(originalDir), "Failed to restore working directory")
	}()

	// Write a valid config file
	configContent := []byte(`
api_key: "file-test-key-xyz"
origins:
  - "http://localhost:5173"
  - "http://localhost:9090"
groups:
  admin:
    - "read"
    - "write"
`)
	configPath := filepath.Join(tmpDir, "server.config.yaml")
	require.NoError(t, os.WriteFile(configPath, configContent, 0644),
		"Failed to write config file")

	// Verify the file was written
	data, err := os.ReadFile(configPath)
	require.NoError(t, err, "Config file should be readable")
	assert.Contains(t, string(data), "file-test-key-xyz", "Config file should contain the API key")

	// Load config using InitConf (which reads from current directory)
	conf := InitConf()

	// Verify all fields
	assert.True(t, conf.CmdApiKey.IsValid, "API key should be valid")
	assert.Equal(t, "file-test-key-xyz", conf.CmdApiKey.Key)
	assert.ElementsMatch(t, []string{"http://localhost:5173", "http://localhost:9090"}, conf.Origins)
	assert.Contains(t, conf.Groups, types.GroupApiKey("admin"))
	assert.ElementsMatch(t, []string{"read", "write"}, conf.Groups[types.GroupApiKey("admin")])
}

// ---------------------------------------------------------------------------
// 9. TestInitConf_MissingFile
// ---------------------------------------------------------------------------

func TestInitConf_MissingFile(t *testing.T) {
	// NOTE: Not using t.Parallel() — this test modifies CWD via os.Chdir

	// Change to a temp dir with NO config file
	tmpDir := t.TempDir()
	originalDir, err := os.Getwd()
	require.NoError(t, err)
	require.NoError(t, os.Chdir(tmpDir), "Failed to chdir to temp dir")
	defer func() {
		require.NoError(t, os.Chdir(originalDir), "Failed to restore working directory")
	}()

	// Verify no config file exists
	_, statErr := os.Stat("server.config.yaml")
	assert.True(t, os.IsNotExist(statErr), "Config file should not exist in temp dir")

	// InitConf should panic when config file is missing.
	// Use defer/recover to capture the panic value for verification.
	var recovered interface{}
	func() {
		defer func() {
			recovered = recover()
		}()
		InitConf()
	}()

	require.NotNil(t, recovered, "InitConf should panic when config file is missing")

	// The panic value is an error (from fmt.Errorf in the source code)
	var panicErr error
	if e, ok := recovered.(error); ok {
		panicErr = e
	} else {
		panicErr = fmt.Errorf("%v", recovered)
	}
	assert.Contains(t, panicErr.Error(), "server.config",
		"Panic message should reference the config file name: %s", panicErr.Error())
}

// ---------------------------------------------------------------------------
// 10. TestCreate_NewFile
// ---------------------------------------------------------------------------

func TestCreate_NewFile(t *testing.T) {
	// NOTE: Not using t.Parallel() — this test modifies CWD via os.Chdir

	// Change to a temp dir where no config file exists
	tmpDir := t.TempDir()
	originalDir, err := os.Getwd()
	require.NoError(t, err)
	require.NoError(t, os.Chdir(tmpDir), "Failed to chdir to temp dir")
	defer func() {
		require.NoError(t, os.Chdir(originalDir), "Failed to restore working directory")
	}()

	// Verify file does not exist before Create()
	configPath := filepath.Join(tmpDir, "server.config.yaml")
	_, err = os.Stat(configPath)
	require.True(t, os.IsNotExist(err), "Config file should not exist before Create()")

	// Call Create()
	Create()

	// Verify file was created
	_, err = os.Stat(configPath)
	require.NoError(t, err, "Config file should exist after Create()")

	// Verify the file is valid YAML with expected fields
	conf := InitConf()
	assert.True(t, conf.CmdApiKey.IsValid, "Created config should have a valid API key")
	assert.NotEmpty(t, conf.CmdApiKey.Key, "API key should not be empty")
	assert.Len(t, conf.CmdApiKey.Key, 64, "API key should be 64 hex characters")

	// Verify origins were set with defaults
	assert.NotEmpty(t, conf.Origins, "Created config should have origins")
}

// ---------------------------------------------------------------------------
// 11. TestCreate_ExistingFile
// ---------------------------------------------------------------------------

func TestCreate_ExistingFile(t *testing.T) {
	// NOTE: Not using t.Parallel() — this test modifies CWD via os.Chdir

	// Change to a temp dir where a config file already exists
	tmpDir := t.TempDir()
	originalDir, err := os.Getwd()
	require.NoError(t, err)
	require.NoError(t, os.Chdir(tmpDir), "Failed to chdir to temp dir")
	defer func() {
		require.NoError(t, os.Chdir(originalDir), "Failed to restore working directory")
	}()

	// Pre-create a config file with known content
	existingContent := []byte(`
api_key: "pre-existing-key-12345"
origins:
  - "http://custom-origin:8080"
`)
	configPath := filepath.Join(tmpDir, "server.config.yaml")
	require.NoError(t, os.WriteFile(configPath, existingContent, 0644))

	// Record the modification time before Create()
	infoBefore, err := os.Stat(configPath)
	require.NoError(t, err)
	mtimeBefore := infoBefore.ModTime()

	// Call Create() — should skip because file already exists
	Create()

	// Verify file was NOT modified (mtime should be same or very close)
	infoAfter, err := os.Stat(configPath)
	require.NoError(t, err)
	mtimeAfter := infoAfter.ModTime()

	assert.True(t,
		mtimeAfter.Equal(mtimeBefore) || mtimeAfter.After(mtimeBefore),
		"File should not be overwritten when it already exists")

	// Verify the content is still the original
	data, err := os.ReadFile(configPath)
	require.NoError(t, err)
	assert.Contains(t, string(data), "pre-existing-key-12345",
		"Existing config key should be preserved")
}
