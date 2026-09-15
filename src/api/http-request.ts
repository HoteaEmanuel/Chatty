import axios from 'axios';
import { HUGGING_FACE_API_KEY, OPENAI_API_KEY } from '../keys/keys';
import { Alert } from 'react-native';

const HUGGING_FACE_URL = 'https://router.huggingface.co/hf-inference/models';

export const getHuggingFaceResponse = async (msg: string) => {
  try {
    const response = await axios.post(
      HUGGING_FACE_URL + '/distilgpt2',
      {
        inputs: msg,
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return (
      response.data[0]?.generated_text ?? "Sorry, I didn't get a response."
    );
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.message
      : 'An unknown error occured';
    console.log(errorMessage);
    Alert.alert(errorMessage);
  }
};

const openAIURL = 'https://api.openai.com/v1/chat/completions';
export const getOpenAIResponse = async (msg: string) => {
  try {
    const response = await axios.post(
      openAIURL,
      {
        model: 'gpt-5.4-nano',
        messages: [
          {
            content: msg,
            role: 'user',
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return (
      response.data.choices[0]?.message?.content ??
      "Sorry, I didn't get a response."
    );
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error?.message
      : 'An unknown error occured';
    console.log(errorMessage);
    return "An error occured: " + errorMessage;
  }
};
