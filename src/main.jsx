import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Users, Car, Wrench, DollarSign, Archive, Menu, X, BarChart2, PlusCircle, LogOut, ClipboardList, Printer, Trash2, Edit, KeyRound } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

// =================================================================================
// COLE AQUI A CONFIGURAÇÃO DO SEU FIREBASE
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDbHnxLOLJgTmoQyrqQm7TRqC_dNB1C4yY",
  authDomain: "oficinaprofelmax.firebaseapp.com",
  projectId: "oficinaprofelmax",
  storageBucket: "oficinaprofelmax.firebasestorage.app",
  messagingSenderId: "932907075204",
  appId: "1:932907075204:web:1645d0eb775d47c9a2e4d1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function LoginScreen({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            onLogin();
        } catch (err) {
            setError('Email ou senha inválidos.');
            console.error("Erro de login:", err);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-blue-600">OficinaPRO</h1>
                    <p className="mt-2 text-gray-500">Acesso restrito</p>
                </div>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Senha"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <div>
                        <button type="submit" className="w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <KeyRound className="w-5 h-5 mr-2" />
                            Entrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthChecked(true);
        if (currentUser) {
            loadAllData();
        }
    });
    return () => unsubscribe();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
        const fetchCollection = async (collectionName) => {
            const querySnapshot = await getDocs(collection(db, collectionName));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        };
        const [clientsData, vehiclesData, servicesData, budgetsData, expensesData] = await Promise.all([
            fetchCollection('clients'),
            fetchCollection('vehicles'),
            fetchCollection('services'),
            fetchCollection('budgets'),
            fetchCollection('expenses'),
        ]);
        setClients(clientsData);
        setVehicles(vehiclesData);
        setServices(servicesData);
        setBudgets(budgetsData);
        setExpenses(expensesData);
    } catch (error) {
        console.error("Erro ao carregar os dados do Firebase:", error);
        alert("Não foi possível carregar os dados. Verifique a sua conexão e a configuração do Firebase.");
    }
    setIsLoading(false);
  };

  const handleSave = async (type, data) => { /* ...código de salvar... */ };
  const handleDelete = async (type, id) => { /* ...código de deletar... */ };
  const handleApproveBudget = async (budgetToApprove) => { /* ...código de aprovar... */ };
  const handleLogout = async () => {
    await signOut(auth);
  };

  const openModal = (type, data = null) => setModal({ type, data });

  if (!authChecked) {
    return <div className="flex justify-center items-center h-screen w-screen"><p className="text-xl">A verificar autenticação...</p></div>;
  }

  if (!user) {
    return <LoginScreen onLogin={loadAllData} />;
  }

  const renderView = () => { /* ...código de renderizar view... */ };
  const renderModal = () => { /* ...código de renderizar modal... */ };
  const NavItem = ({ view, icon, label }) => { /* ...código do NavItem... */ };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <aside className={`bg-white dark:bg-gray-800 text-gray-800 dark:text-white w-64 fixed inset-y-0 left-0 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 shadow-lg lg:shadow-none`}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">OficinaPRO</h1>
          <button className="lg:hidden text-gray-500" onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
        </div>
        <nav className="p-4">
          <ul>
            <NavItem view="dashboard" icon={<BarChart2 size={20} />} label="Dashboard" />
            <NavItem view="clients" icon={<Users size={20} />} label="Clientes" />
            <NavItem view="vehicles" icon={<Car size={20} />} label="Veículos" />
            <NavItem view="services" icon={<Wrench size={20} />} label="Ordens de Serviço" />
            <NavItem view="budgets" icon={<ClipboardList size={20} />} label="Orçamentos" />
            <NavItem view="finance" icon={<DollarSign size={20} />} label="Financeiro" />
            <NavItem view="inventory" icon={<Archive size={20} />} label="Estoque" />
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
                <LogOut size={20} />
                <span className="ml-4 font-medium">Sair</span>
            </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center lg:justify-end z-30">
          <button className="lg:hidden text-gray-600 dark:text-gray-300" onClick={() => setIsMenuOpen(true)}><Menu size={28} /></button>
          <div className="flex items-center"><span className="mr-4 text-gray-700 dark:text-gray-200">Bem-vindo, {user.email}!</span></div>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">{renderView()}</div>
      </main>
      {renderModal()}
    </div>
  );
}

// ... COLE AQUI O RESTANTE DOS COMPONENTES (Dashboard, GenericView, Clients, etc.) ...
// O código deles não muda, apenas o componente App principal.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
