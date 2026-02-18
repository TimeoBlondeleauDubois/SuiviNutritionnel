import React from 'react'
import { Text, TextProps, useColorScheme, StyleSheet } from 'react-native'

type ThemedTextType = 'default' | 'title' | 'subtitle' | 'link'

type Props = TextProps & {
    type?: ThemedTextType
    lightColor?: string
    darkColor?: string
}

export function ThemedText({
    style,
    type = 'default',
    lightColor,
    darkColor,
    ...rest
}: Props) {
    const scheme = useColorScheme()
    const color =
        scheme === 'dark' ? (darkColor ?? '#fff') : (lightColor ?? '#000')

    return <Text style={[{ color }, styles[type], style]} {...rest} />
}

const styles = StyleSheet.create({
    default: { fontSize: 14, lineHeight: 20 },
    title: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
    subtitle: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    link: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
})
