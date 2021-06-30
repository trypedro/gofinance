import React from 'react'
import { TextInputProps } from 'react-native'

// component styles
import { Container } from './styles'

type Props = TextInputProps

export function Input({...rest}: Props) {
  return(
    <Container {...rest}/>
  )
}