import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Users, Car, Wrench, DollarSign, Archive, Menu, X, BarChart2, PlusCircle, LogOut, ClipboardList, Printer, Trash2, Edit, KeyRound, MinusCircle, FileText } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, deleteDoc, writeBatch, updateDoc, increment } from "firebase/firestore";
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
            if(onLogin) onLogin();
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
                    <div><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" required /></div>
                    <div><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Senha" required /></div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <div><button type="submit" className="w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"><KeyRound className="w-5 h-5 mr-2" />Entrar</button></div>
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
  const [inventory, setInventory] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthChecked(true);
        if (currentUser) {
            loadAllData();
        } else {
            setIsLoading(false);
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
        const [clientsData, vehiclesData, servicesData, budgetsData, expensesData, inventoryData] = await Promise.all([
            fetchCollection('clients'), fetchCollection('vehicles'), fetchCollection('services'), fetchCollection('budgets'), fetchCollection('expenses'), fetchCollection('inventory')
        ]);
        setClients(clientsData);
        setVehicles(vehiclesData);
        setServices(servicesData);
        setBudgets(budgetsData);
        setExpenses(expensesData);
        setInventory(inventoryData);
    } catch (error) {
        console.error("Erro ao carregar os dados do Firebase:", error);
        alert("Não foi possível carregar os dados. Verifique a sua conexão e a configuração do Firebase.");
    }
    setIsLoading(false);
  };

  const handleSave = async (type, data) => {
    setIsLoading(true);
    try {
        const { id, ...dataToSave } = data;
        if (id) {
            await setDoc(doc(db, type, id), dataToSave, { merge: true });
        } else {
            await addDoc(collection(db, type), dataToSave);
        }
    } catch (error) { console.error("Erro ao guardar dados:", error); }
    await loadAllData();
    setModal({ type: null, data: null });
  };

  const handleUpdateInventoryQuantity = async (itemId, amount) => {
    setIsLoading(true);
    const itemRef = doc(db, "inventory", itemId);
    try {
        await updateDoc(itemRef, { quantity: increment(amount) });
    } catch (error) { console.error("Erro ao atualizar quantidade:", error); }
    await loadAllData();
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`Tem a certeza que deseja excluir este item permanentemente?`)) {
        setIsLoading(true);
        try {
            await deleteDoc(doc(db, type, id));
        } catch (error) { console.error("Erro ao eliminar dados:", error); }
        await loadAllData();
    }
  };

  const handleApproveBudget = async (budgetToApprove) => {
      setIsLoading(true);
      try {
        const batch = writeBatch(db);
        const budgetRef = doc(db, "budgets", budgetToApprove.id);
        batch.update(budgetRef, { status: "Aprovado" });
        const client = clients.find(c => c.id === budgetToApprove.clientId);
        const vehicle = vehicles.find(v => v.id === budgetToApprove.vehicleId);
        const newService = {
            budgetId: budgetToApprove.id, vehicleId: budgetToApprove.vehicleId, clientName: client?.name || 'N/A', vehicleModel: vehicle ? `${vehicle.model} (${vehicle.plate})` : 'N/A',
            description: `Serviços do orçamento #${budgetToApprove.id.substring(0,5)}`, items: budgetToApprove.items, totalPrice: budgetToApprove.totalAmount, status: 'Em andamento', date: new Date().toISOString().split('T')[0],
        };
        const serviceRef = doc(collection(db, "services"));
        batch.set(serviceRef, newService);
        await batch.commit();
      } catch (error) { console.error("Erro ao aprovar orçamento:", error); }
      await loadAllData();
  };

  const handleLogout = async () => { await signOut(auth); };
  const openModal = (type, data = null) => setModal({ type, data });

  if (!authChecked) { return <div className="flex justify-center items-center h-screen w-screen"><p className="text-xl">A verificar autenticação...</p></div>; }
  if (!user) { return <LoginScreen onLogin={loadAllData} />; }

  const renderView = () => {
    if (isLoading) return <div className="flex justify-center items-center h-full w-full"><p className="text-xl">A carregar dados do sistema...</p></div>;
    const props = { clients, vehicles, services, budgets, expenses, inventory, openModal, handleDelete, handleApproveBudget, onSave: handleSave, handleUpdateInventoryQuantity };
    switch (activeView) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'clients': return <Clients {...props} />;
      case 'vehicles': return <Vehicles {...props} />;
      case 'services': return <Services {...props} />;
      case 'budgets': return <Budgets {...props} />;
      case 'finance': return <Finance {...props} />;
      case 'inventory': return <Inventory {...props} />;
      case 'reports': return <Reports {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  const renderModal = () => {
    if (!modal.type) return null;
    const commonProps = { onClose: () => setModal({type: null, data: null}), onSave: (data) => handleSave(modal.type, data) };
    switch (modal.type) {
        case 'budgets': return <BudgetEditor budget={modal.data} clients={clients} vehicles={vehicles} {...commonProps} />;
        case 'clients': return <ClientEditor client={modal.data} {...commonProps} />;
        case 'vehicles': return <VehicleEditor vehicle={modal.data} clients={clients} {...commonProps} />;
        case 'inventory': return <InventoryEditor item={modal.data} {...commonProps} />;
        default: return null;
    }
  };

  const NavItem = ({ view, icon, label }) => ( <li className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${activeView === view ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`} onClick={() => { setActiveView(view); setIsMenuOpen(false); }}> {icon} <span className="ml-4 font-medium">{label}</span> </li> );

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
            <NavItem view="inventory" icon={<Archive size={20} />} label="Estoque" />
            <NavItem view="finance" icon={<DollarSign size={20} />} label="Financeiro" />
            <NavItem view="reports" icon={<FileText size={20} />} label="Relatórios" />
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
                <LogOut size={20} /> <span className="ml-4 font-medium">Sair</span>
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

function Dashboard({ clients, vehicles, services, budgets }) {
    const servicesThisMonth = services.filter(s => { const serviceDate = new Date(s.date); const today = new Date(); return serviceDate.getMonth() === today.getMonth() && serviceDate.getFullYear() === today.getFullYear(); }).length;
    const StatCard = ({ title, value, icon, color }) => ( <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center justify-between transition-transform hover:scale-105"> <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p></div> <div className={`p-3 rounded-full ${color}`}>{icon}</div> </div> );
    return ( <div className="animate-fade-in"> <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Dashboard</h2> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> <StatCard title="Total de Clientes" value={clients.length} icon={<Users className="text-white" />} color="bg-blue-500" /> <StatCard title="Serviços no Mês" value={servicesThisMonth} icon={<Car className="text-white" />} color="bg-green-500" /> <StatCard title="Serviços em Andamento" value={services.filter(s => s.status === 'Em andamento').length} icon={<Wrench className="text-white" />} color="bg-yellow-500" /> <StatCard title="Orçamentos Pendentes" value={budgets.filter(b => b.status === 'Pendente').length} icon={<ClipboardList className="text-white" />} color="bg-indigo-500" /> </div> </div> );
}

function GenericView({ title, columns, data, renderRow, onAddItem, children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredData = data.filter(item => Object.entries(item).some(([key, value]) => key !== 'id' && String(value).toLowerCase().includes(searchTerm.toLowerCase())) );
  return ( <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg animate-fade-in"> <div className="flex flex-col md:flex-row justify-between items-center mb-6"> <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">{title}</h2> <div className="w-full md:w-auto flex items-center space-x-4"> <input type="text" placeholder="Buscar..." className="w-full md:w-64 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> {onAddItem && <button onClick={onAddItem} className="flex items-center justify-center p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-transform hover:scale-110 shadow"><PlusCircle size={24}/></button>} </div> </div> {children} <div className="overflow-x-auto"><table className="w-full text-left"> <thead className="bg-gray-100 dark:bg-gray-700"><tr> {columns.map((col, index) => <th key={index} className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-sm">{col}</th>)} {columns.length > 0 && <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-sm text-right">Ações</th>} </tr></thead> <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{filteredData.map(item => renderRow(item))}</tbody> </table>{filteredData.length === 0 && <div className="text-center py-10"><p className="text-gray-500 dark:text-gray-400">Nenhum item encontrado.</p></div>}</div> </div> );
}

function Clients({ clients, openModal, handleDelete }) {
  const columns = ['Nome', 'Telefone', 'Email'];
  const renderRow = (client) => ( <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50"> <td className="p-4 text-gray-800 dark:text-gray-200">{client.name}</td> <td className="p-4 text-gray-600 dark:text-gray-300">{client.phone}</td> <td className="p-4 text-gray-600 dark:text-gray-300">{client.email}</td> <td className="p-4 text-right space-x-2"> <button onClick={() => openModal('clients', client)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={18}/></button> <button onClick={() => handleDelete('clients', client.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18}/></button> </td> </tr> );
  return <GenericView title="Clientes" columns={columns} data={clients} renderRow={renderRow} onAddItem={() => openModal('clients')} />;
}

function Vehicles({ vehicles, clients, openModal, handleDelete }) {
  const columns = ['Modelo', 'Ano', 'Placa', 'Cliente'];
  const renderRow = (vehicle) => { const client = clients.find(c => c.id === vehicle.clientId); return ( <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50"> <td className="p-4 text-gray-800 dark:text-gray-200">{vehicle.model}</td> <td className="p-4 text-gray-600 dark:text-gray-300">{vehicle.year}</td> <td className="p-4 text-gray-600 dark:text-gray-300">{vehicle.plate}</td> <td className="p-4 text-gray-600 dark:text-gray-300">{client ? client.name : 'N/A'}</td> <td className="p-4 text-right space-x-2"> <button onClick={() => openModal('vehicles', vehicle)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={18}/></button> <button onClick={() => handleDelete('vehicles', vehicle.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18}/></button> </td> </tr> ); };
  return <GenericView title="Veículos" columns={columns} data={vehicles} renderRow={renderRow} onAddItem={() => openModal('vehicles')} />;
}

function Services({ services, clients, vehicles }) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const getClientName = (vehicleId) => { const vehicle = vehicles.find(v => v.id === vehicleId); const client = clients.find(c => c.id === vehicle?.clientId); return client?.name || 'N/A'; };
  const filteredServices = services.filter(service => { if (!selectedClientId) return true; const vehicle = vehicles.find(v => v.id === service.vehicleId); return vehicle?.clientId === selectedClientId; });
  const columns = ['O.S #', 'Cliente', 'Veículo', 'Data', 'Preço', 'Status'];
  const renderRow = (service) => ( <tr key={service.id}> <td className="p-4 font-bold">#{service.budgetId.substring(0,5)}</td> <td>{getClientName(service.vehicleId)}</td> <td>{service.vehicleModel}</td> <td>{service.date}</td> <td>R$ {service.totalPrice.toFixed(2)}</td> <td><span className={`px-3 py-1 text-sm font-medium rounded-full ${service.status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{service.status}</span></td> <td className="p-4 text-right"><button className="text-blue-500 hover:text-blue-700">Detalhes</button></td> </tr> );
  return ( <GenericView title="Ordens de Serviço" columns={columns} data={filteredServices} renderRow={renderRow}> <div className="mb-4"> <label className="mr-2">Filtrar por Cliente:</label> <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="p-2 border rounded-md"> <option value="">Todos os Clientes</option> {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)} </select> </div> </GenericView> );
}

function Budgets({ budgets, clients, vehicles, handleApproveBudget, openModal, handleDelete }) {
    const columns = ['Orçamento #', 'Cliente', 'Veículo', 'Data', 'Valor Total', 'Status'];
    const renderRow = (budget) => { const client = clients.find(c => c.id === budget.clientId); const vehicle = vehicles.find(v => v.id === budget.vehicleId); return ( <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50"> <td className="p-4 text-gray-800 dark:text-gray-200 font-bold">#{budget.id.substring(0,5)}</td> <td className="p-4 text-gray-600 dark:text-gray-300">{client ? client.name : 'N/A'}</td> <td className="p-4 text-gray-600 dark:text-gray-300">{vehicle ? `${vehicle.model} (${vehicle.plate})` : 'N/A'}</td> <td className="p-4 text-gray-600 dark:text-gray-300">{budget.date}</td> <td className="p-4 text-gray-600 dark:text-gray-300">R$ {budget.totalAmount.toFixed(2)}</td> <td className="p-4"><span className={`px-3 py-1 text-sm font-medium rounded-full ${budget.status === 'Aprovado' ? 'bg-green-100 text-green-800' : budget.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{budget.status}</span></td> <td className="p-4 text-right space-x-2"> <button onClick={() => openModal('budgets', budget)} className="text-blue-500 hover:text-blue-700 p-1">Ver/Imprimir</button> {budget.status === 'Pendente' && <button onClick={() => handleApproveBudget(budget)} className="text-green-500 hover:text-green-700 p-1">Aprovar</button>} <button onClick={() => handleDelete('budgets', budget.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18}/></button> </td> </tr> ); };
    return <GenericView title="Orçamentos" columns={columns} data={budgets} renderRow={renderRow} onAddItem={() => openModal('budgets')} />;
}

function Finance({ services, expenses, onSave, handleDelete }) {
  const [description, setDescription] = useState(''); const [category, setCategory] = useState('Peças'); const [amount, setAmount] = useState('');
  const totalRevenue = services.filter(s => s.status === 'Concluído').reduce((acc, s) => acc + s.totalPrice, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0); const profit = totalRevenue - totalExpenses;
  const handleSubmit = (e) => { e.preventDefault(); if (!description || !amount) return; onSave('expenses', { description, category, amount: parseFloat(amount), date: new Date().toISOString().split('T')[0] }); setDescription(''); setAmount(''); };
  return ( <div className="animate-fade-in space-y-8"> <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Financeiro</h2> <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> <div className="bg-green-100 dark:bg-green-800/30 p-6 rounded-xl shadow-md"><p className="text-lg font-medium text-green-800 dark:text-green-200">Receita Total</p><p className="text-3xl font-bold text-green-900 dark:text-white">R$ {totalRevenue.toFixed(2)}</p></div> <div className="bg-red-100 dark:bg-red-800/30 p-6 rounded-xl shadow-md"><p className="text-lg font-medium text-red-800 dark:text-red-200">Despesa Total</p><p className="text-3xl font-bold text-red-900 dark:text-white">R$ {totalExpenses.toFixed(2)}</p></div> <div className={`p-6 rounded-xl shadow-md ${profit >= 0 ? 'bg-blue-100 dark:bg-blue-800/30' : 'bg-gray-200'}`}><p className={`text-lg font-medium ${profit >= 0 ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800'}`}>Lucro / Prejuízo</p><p className={`text-3xl font-bold ${profit >= 0 ? 'text-blue-900 dark:text-white' : 'text-gray-900'}`}>R$ {profit.toFixed(2)}</p></div> </div> <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"> <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Adicionar Despesa</h3> <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"> <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Descrição / Fornecedor</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full p-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700" required /></div> <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Categoria</label><select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full p-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"><option>Peças</option><option>Fixo</option><option>Marketing</option><option>Outros</option></select></div> <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Valor (R$)</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 w-full p-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700" required /></div> <button type="submit" className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 h-10">Adicionar</button> </form> </div> <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"> <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Histórico de Despesas</h3> <div className="overflow-x-auto"><table className="w-full text-left"> <thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-3">Descrição</th><th className="p-3">Categoria</th><th className="p-3">Data</th><th className="p-3 text-right">Valor</th><th className="p-3 text-right">Ações</th></tr></thead> <tbody>{expenses.map(e => (<tr key={e.id} className="border-b dark:border-gray-700"> <td className="p-3">{e.description}</td><td className="p-3">{e.category}</td><td className="p-3">{e.date}</td><td className="p-3 text-right text-red-600">R$ {e.amount.toFixed(2)}</td> <td className="p-3 text-right"><button onClick={() => handleDelete('expenses', e.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18}/></button></td> </tr>))}</tbody> </table></div> </div> </div> );
}

function Inventory({ inventory, openModal, handleDelete, handleUpdateInventoryQuantity }) {
    const columns = ["Material", "Marca", "Aplicação", "Quantidade", "Ajuste Rápido"];
    const renderRow = (item) => ( <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50"> <td className="p-4">{item.materialType}</td> <td className="p-4">{item.brand}</td> <td className="p-4">{item.application}</td> <td className="p-4 font-bold">{item.quantity}</td> <td className="p-4 space-x-2"> <button onClick={() => handleUpdateInventoryQuantity(item.id, 1)} className="p-1 bg-green-500 text-white rounded-full"><PlusCircle size={18}/></button> <button onClick={() => handleUpdateInventoryQuantity(item.id, -1)} className="p-1 bg-red-500 text-white rounded-full"><MinusCircle size={18}/></button> </td> <td className="p-4 text-right space-x-2"> <button onClick={() => openModal('inventory', item)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={18}/></button> <button onClick={() => handleDelete('inventory', item.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18}/></button> </td> </tr> );
    return <GenericView title="Estoque de Peças" columns={columns} data={inventory} renderRow={renderRow} onAddItem={() => openModal('inventory')} />;
}

function Reports({ services, clients, vehicles }) {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const getClientName = (vehicleId) => { const vehicle = vehicles.find(v => v.id === vehicleId); const client = clients.find(c => c.id === vehicle?.clientId); return client?.name || 'N/A'; };
    const monthlyServices = services.filter(s => { const serviceDate = new Date(s.date); return serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear; });
    return ( <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg animate-fade-in"> <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Relatório de Serviços Mensal</h2> <p className="mb-4">Exibindo {monthlyServices.length} serviço(s) para o mês {currentMonth + 1}/{currentYear}.</p> <div className="overflow-x-auto"> <table className="w-full text-left"> <thead className="bg-gray-100 dark:bg-gray-700"> <tr> <th className="p-4">Data</th> <th className="p-4">Cliente</th> <th className="p-4">Veículo</th> <th className="p-4">Descrição</th> <th className="p-4 text-right">Valor</th> </tr> </thead> <tbody className="divide-y divide-gray-200 dark:divide-gray-700"> {monthlyServices.map(s => ( <tr key={s.id}> <td className="p-4">{s.date}</td> <td className="p-4">{getClientName(s.vehicleId)}</td> <td className="p-4">{s.vehicleModel}</td> <td className="p-4">{s.description}</td> <td className="p-4 text-right">R$ {s.totalPrice.toFixed(2)}</td> </tr> ))} </tbody> </table> </div> </div> );
}

function Modal({ title, onClose, children }) {
    return ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"> <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"> <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center"> <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2> <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white"><X size={24}/></button> </div> {children} </div> </div> );
}

function ClientEditor({ client, onSave, onClose }) {
    const [data, setData] = useState({ id: null, name: '', phone: '', email: '' });
    useEffect(() => { if (client) setData(client); else setData({ id: null, name: '', phone: '', email: '' }); }, [client]);
    const handleChange = (e) => setData({...data, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(data); };
    return ( <Modal title={client ? 'Editar Cliente' : 'Novo Cliente'} onClose={onClose}> <form onSubmit={handleSubmit} className="p-6 space-y-4"> <div><label>Nome</label><input name="name" value={data.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div> <div><label>Telefone</label><input name="phone" value={data.phone} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div> <div><label>Email</label><input type="email" name="email" value={data.email} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div> <div className="pt-4 flex justify-end"><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button></div> </form> </Modal> );
}

function VehicleEditor({ vehicle, clients, onSave, onClose }) {
    const [data, setData] = useState({ id: null, model: '', year: '', plate: '', color: '', km: '', clientId: '' });
    useEffect(() => { if (vehicle) setData(vehicle); else setData({ id: null, model: '', year: '', plate: '', color: '', km: '', clientId: '' }); }, [vehicle]);
    const handleChange = (e) => setData({...data, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(data); };
    return ( <Modal title={vehicle ? 'Editar Veículo' : 'Novo Veículo'} onClose={onClose}> <form onSubmit={handleSubmit} className="p-6 space-y-4"> <div><label>Cliente</label><select name="clientId" value={data.clientId} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required><option value="">Selecione</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div> <div><label>Modelo</label><input name="model" value={data.model} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div> <div><label>Placa</label><input name="plate" value={data.plate} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div> <div><label>Ano</label><input name="year" value={data.year} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div> <div><label>Cor</label><input name="color" value={data.color} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div> <div><label>KM</label><input name="km" value={data.km} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div> <div className="pt-4 flex justify-end"><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button></div> </form> </Modal> );
}

function InventoryEditor({ item, onSave, onClose }) {
    const [data, setData] = useState({ id: null, materialType: '', brand: '', application: '', quantity: 0 });
    useEffect(() => { if (item) setData(item); else setData({ id: null, materialType: '', brand: '', application: '', quantity: 0 }); }, [item]);
    const handleChange = (e) => setData({...data, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(data); };
    return ( <Modal title={item ? 'Editar Item do Estoque' : 'Novo Item no Estoque'} onClose={onClose}> <form onSubmit={handleSubmit} className="p-6 space-y-4"> <div><label>Tipo de Material</label><input name="materialType" value={data.materialType} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div> <div><label>Marca</label><input name="brand" value={data.brand} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div> <div><label>Veículo Aplicado</label><input name="application" value={data.application} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div> <div><label>Quantidade</label><input type="number" name="quantity" value={data.quantity} onChange={(e) => setData({...data, quantity: parseInt(e.target.value, 10) || 0})} className="w-full mt-1 p-2 border rounded-md" required /></div> <div className="pt-4 flex justify-end"><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button></div> </form> </Modal> );
}

function BudgetEditor({ budget, clients, vehicles, onSave, onClose }) {
  const [currentBudget, setCurrentBudget] = useState(null);
  useEffect(() => {
    setCurrentBudget(budget ? {...budget} : { id: null, clientId: '', vehicleId: '', date: new Date().toISOString().split('T')[0], status: 'Pendente', items: [{ id: Date.now(), qty: 1, desc: '', price: 0 }], totalAmount: 0 });
  }, [budget]);
  const handleItemChange = (itemId, field, value) => { const newItems = currentBudget.items.map(item => item.id === itemId ? { ...item, [field]: value } : item); updateBudgetItems(newItems); };
  const addItem = () => updateBudgetItems([...currentBudget.items, { id: Date.now(), qty: 1, desc: '', price: 0 }]);
  const removeItem = (itemId) => updateBudgetItems(currentBudget.items.filter(item => item.id !== itemId));
  const updateBudgetItems = (items) => { const totalAmount = items.reduce((acc, item) => acc + ((item.qty || 0) * (item.price || 0)), 0); setCurrentBudget(prev => ({ ...prev, items, totalAmount })); };
  const handleClientChange = (clientId) => setCurrentBudget(prev => ({ ...prev, clientId: clientId, vehicleId: '' }));
  const generatePDF = () => alert("A geração de PDF será configurada no ambiente de produção final.");
  if (!currentBudget) return null;
  const filteredVehicles = vehicles.filter(v => v.clientId === currentBudget.clientId);
  return ( <Modal title={budget ? 'Editar Orçamento' : 'Novo Orçamento'} onClose={onClose}> <div className="p-6 overflow-y-auto"> <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"> <div><label>Cliente</label><select value={currentBudget.clientId} onChange={(e) => handleClientChange(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required><option value="">Selecione</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div> <div><label>Veículo</label><select value={currentBudget.vehicleId} onChange={(e) => setCurrentBudget(prev => ({...prev, vehicleId: e.target.value}))} className="w-full mt-1 p-2 border rounded-md" disabled={!currentBudget.clientId} required><option value="">Selecione</option>{filteredVehicles.map(v => <option key={v.id} value={v.id}>{`${v.model} - ${v.plate}`}</option>)}</select></div> </div> <div className="space-y-2"> {currentBudget.items.map(item => ( <div key={item.id} className="grid grid-cols-12 gap-2 items-center"> <input type="text" value={item.desc} onChange={e => handleItemChange(item.id, 'desc', e.target.value)} placeholder="Descrição" className="col-span-5 p-2 border rounded-md" /> <input type="number" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)} className="col-span-2 text-center p-2 border rounded-md" /> <input type="number" value={item.price} onChange={e => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)} className="col-span-2 p-2 border rounded-md" /> <span className="col-span-2 p-2 text-right">R$ {((item.qty || 0) * (item.price || 0)).toFixed(2)}</span> <button onClick={() => removeItem(item.id)} className="col-span-1 text-red-500 hover:text-red-700 flex justify-center"><Trash2 size={18}/></button> </div> ))} <button onClick={addItem} className="text-blue-500 hover:text-blue-700 mt-2">+ Adicionar Item</button> </div> <div className="mt-6 text-right"><p className="text-2xl font-bold text-gray-800 dark:text-white">Total: R$ {currentBudget.totalAmount.toFixed(2)}</p></div> </div> <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end space-x-3"> <button onClick={generatePDF} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"><Printer size={18} className="mr-2"/> Imprimir / PDF</button> <button onClick={() => onSave(currentBudget)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button> </div> </Modal> );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
