package lm

import (
	"fmt"
)

// InterfaceToStringArray converts []interface{} to []string, skipping non-string elements.
func InterfaceToStringArray(interfaceSlice []interface{}) []string {
	// Convert to slice of string
	stringSlice := make([]string, 0, len(interfaceSlice))
	for _, v := range interfaceSlice {
		if str, ok := v.(string); ok {
			stringSlice = append(stringSlice, str)
		} else {
			// Handle the case where the element is not a string
			fmt.Printf("Skipping non-string element in InterfaceToStringArray: %v\n", v)
		}
	}
	return stringSlice
}
