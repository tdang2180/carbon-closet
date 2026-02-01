// app/actions/auth.js
'use server';

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { redirect } from "next/navigation";

export async function signup(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const name = formData.get('name');

  if (!email || !password || !name) {
    return { error: 'All fields are required' };
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error };
    }

    redirect('/dashboard');
  } catch (error) {
    return { error: 'Something went wrong' };
  }
}

export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error };
    }

    redirect('/dashboard');
  } catch (error) {
    return { error: 'Invalid login credentials' };
  }
}
