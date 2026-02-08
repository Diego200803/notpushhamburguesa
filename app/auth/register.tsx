import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/lib/core/supabase/client.supabase';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (!email || !password || !firstName || !lastName) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            const { data: { user }, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([{ 
                        id: user.id, 
                        email: user.email, 
                        first_name: firstName, 
                        last_name: lastName 
                    }]);
                
                if (profileError) {
                    console.error("Error creando perfil:", profileError);
                }
            }

            Alert.alert("¡Éxito!", "Cuenta creada. Revisa tu email para confirmar.");
            router.replace('/auth/login');

        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crear Cuenta</Text>
            
            <TextInput 
                placeholder="Nombre"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
            />

            <TextInput 
                placeholder="Apellido"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
            />
            
            <TextInput 
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            
            <TextInput 
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleRegister} 
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Registrando..." : "Crear Cuenta"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f9fafb',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#1f2937',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 15,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#10b981',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    linkText: {
        marginTop: 20,
        textAlign: 'center',
        color: '#3b82f6',
        fontSize: 14,
    },
});