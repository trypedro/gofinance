import React, { useState } from 'react'
import { Modal, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import uuid from 'react-native-uuid'
import { useNavigation } from '@react-navigation/native'

// components
import { Button } from '../../components/Form/Buttom'
import { CategorySelectButton } from '../../components/Form/CategorySelectButton'
import { InputForm } from '../../components/Form/InputForm'
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton'
import { CategorySelect } from '../CategorySelect'

// components styles from register
import {
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionTypes,
} from './styles'

interface FormData {
  name: string
  amount: string
}

const schema = Yup.object().shape({
  name: Yup
  .string()
  .required('Nome é obrigatório'),

  amount: Yup
  .number()
  .required('Valor é obrigatório')
  .typeError('Informe um valor númerico')
  .positive('O valor não pode ser negativo')
})

const categoryDefault = { key: 'category', name: 'Categoria' }

export function Register() {
  const [transactionType, setTransactionType] = useState('')
  const [category, setCategory] = useState(categoryDefault)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  
  const navigation = useNavigation()

  const { control, handleSubmit, formState: { errors }, reset } = useForm({ resolver: yupResolver(schema) })

  async function handleRegister(form: FormData) {
    if (!transactionType)
      return Alert.alert('Selecione o tipo da transação')

    if (category.key === 'category') 
      return Alert.alert('Selecione a categoria')

      
      const newTransaction = {
        id: String(uuid.v4()),
        name: form.name,
        amount: form.amount,
        type: transactionType,
        category: category.key,
        date: new Date(),
    }
    
    try {
      const dataKey = '@gofinance:transactions'
      
      const data = await AsyncStorage.getItem(dataKey)
      const currentData = data ? JSON.parse(data) : []

      const dataFormatted = [
        ...currentData,
        newTransaction
      ]

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted))

      setTransactionType('')
      setCategory(categoryDefault)
      reset()

      // go to home
      navigation.navigate('Listagem')

    } catch (err) {
      console.log(err)
      Alert.alert('Não foi possível salvar!')
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>
          <Fields>
            <InputForm
              name='name'
              placeholder='Nome'
              control={control}
              autoCapitalize='sentences'
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />
            <InputForm
              name='amount'
              placeholder='Preço'
              control={control}
              keyboardType='numeric'
              error={errors.amount && errors.amount.message}
            />

            <TransactionTypes>
              <TransactionTypeButton
                type='up'
                title='Income'
                onPress={() => setTransactionType('positive')}
                isActive={transactionType === 'positive'}
              />
              <TransactionTypeButton
                type='down'
                title='Outcome'
                onPress={() => setTransactionType('negative')}
                isActive={transactionType === 'negative'}
              />
            </TransactionTypes>

            <CategorySelectButton
              title={category.name}
              onPress={() => setCategoryModalOpen(true)}
            />
          </Fields>

          <Button title='Enviar' onPress={handleSubmit(handleRegister)} />
        </Form>

        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={() => setCategoryModalOpen(false)}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  )
}
