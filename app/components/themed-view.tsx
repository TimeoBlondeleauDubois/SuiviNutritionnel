import React from 'react'
import { View, ViewProps, useColorScheme } from 'react-native'

type Props = ViewProps & {
    lightColor?: string
    darkColor?: string
}

export function ThemedView({
    style,
    lightColor = '#fff',
    darkColor = '#000',
    ...props
}: Props) {
    const scheme = useColorScheme()
    const backgroundColor = scheme === 'dark' ? darkColor : lightColor

    return <View style={[{ backgroundColor }, style]} {...props} />
}
