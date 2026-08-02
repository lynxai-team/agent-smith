package lm

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestInterfaceToStringArray_AllStrings verifies all string elements are preserved.
func TestInterfaceToStringArray_AllStrings(t *testing.T) {
	input := []interface{}{"hello", "world", "foo"}
	result := InterfaceToStringArray(input)

	assert.Equal(t, []string{"hello", "world", "foo"}, result)
}

// TestInterfaceToStringArray_MixedTypes verifies only strings are preserved from mixed types.
func TestInterfaceToStringArray_MixedTypes(t *testing.T) {
	input := []interface{}{"hello", 42, "world", 3.14, "foo"}
	result := InterfaceToStringArray(input)

	assert.Equal(t, []string{"hello", "world", "foo"}, result)
}

// TestInterfaceToStringArray_EmptySlice verifies empty input produces empty output.
func TestInterfaceToStringArray_EmptySlice(t *testing.T) {
	input := []interface{}{}
	result := InterfaceToStringArray(input)

	assert.Empty(t, result)
}

// TestInterfaceToStringArray_NonStringsOnly verifies no strings produces empty output.
func TestInterfaceToStringArray_NonStringsOnly(t *testing.T) {
	input := []interface{}{42, 3.14, true, nil}
	result := InterfaceToStringArray(input)

	assert.Empty(t, result)
}

// TestInterfaceToStringArray_NilElements verifies nil elements are skipped gracefully.
func TestInterfaceToStringArray_NilElements(t *testing.T) {
	input := []interface{}{"hello", nil, "world", nil}
	result := InterfaceToStringArray(input)

	assert.Equal(t, []string{"hello", "world"}, result)
}
