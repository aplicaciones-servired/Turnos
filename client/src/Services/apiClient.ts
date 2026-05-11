import axios from 'axios';
import { API_DATA } from '@/Utils/const';

export const apiClient = axios.create({
  baseURL: API_DATA,
  headers: {
    'Content-Type': 'application/json',
  },
});
