'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  collection, 
  addDoc, 
  getDocs 
} from 'firebase/firestore';

// Configuración básica para conectar al emulador local
const firebaseConfig = { projectId: 'educa360-ryuu' };
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Conectar al emulador de Firestore local (puerto 8080)
if (typeof window !== 'undefined') {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  } catch (e) {
    // Ya conectado
  }
}

export default function Home() {
  const [texto, setTexto] = useState('');
  const [listaDatos, setListaDatos] = useState<string[]>([]);

  // Función para leer los datos de la colección temporal
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pruebas_temporales'));
      const docs: string[] = [];
      querySnapshot.forEach((doc) => {
        docs.push(doc.data().contenido || '');
      });
      setListaDatos(docs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para guardar el dato al pulsar el botón
  const guardarDato = async () => {
    if (!texto.trim()) return;
    await addDoc(collection(db, 'pruebas_temporales'), {
      contenido: texto,
      fecha: new Date().toISOString(),
    });
    setTexto('');
    await cargarDatos(); // Vuelve a leer para mostrarlo al instante
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Portal Clínico - EDUCA360</h1>
      <p>Entorno local verificado y listo para desarrollo de módulos.</p>
      
      <div style={{ margin: '20px 0' }}>
        <input 
          type="text" 
          value={texto} 
          onChange={(e) => setTexto(e.target.value)} 
          placeholder="Escribe algo de prueba..."
          style={{ padding: '8px', width: '250px', marginRight: '10px' }}
        />
        <button onClick={guardarDato} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Guardar
        </button>
      </div>

      <h2>Datos leídos de la colección 'pruebas_temporales':</h2>
      <ul>
        {listaDatos.map((item, index) => (
          <li key={index} style={{ fontSize: '16px', color: 'green', fontWeight: 'bold' }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}