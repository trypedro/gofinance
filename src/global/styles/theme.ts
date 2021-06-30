import { lighten } from 'polished'

export default {
  colors: {
    primary: '#5636D3',

    secondary_light:  lighten(0.3, '#FF872C'),
    secondary: '#FF872C',

    success_light: lighten(0.5, '#12A454'),
    success: '#12A454',

    attention_light: lighten(0.3, '#E83F5B'),
    attention: '#E83F5B',


    shape: '#FFF',
    title: '#363F5F',
    text: '#969CB2',
    text_dark: '#000000',
    background: '#F0F2F5'
  }, 

  fonts: {
    regular: ' Poppins_400Regular',
    medium: 'Poppins_500Medium',
    bold: 'Poppins_700Bold'
  }
}