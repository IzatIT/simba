import {useCallback, useState} from 'react'

export const useToggle = (initial = false) => {
    const [state, setState] = useState(initial)
    const toggle = useCallback(() => setState((s) => !s), [])

    return {state, toggle, setState}
}
