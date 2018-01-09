export function setLoading(booleanValue) {
	return {
    type: "SET_LOADING",
    payload: booleanValue,
	}
}

export function updateTextData(data) {
  return {
    type: "UPDATE_TEXTDATA",
    payload: data
  }
}

export function updateText(text) {
  return {
    type: "UPDATE_TEXT",
    payload: text
  }
}
