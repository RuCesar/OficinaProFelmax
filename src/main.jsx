import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Users, Car, Wrench, DollarSign, Archive, Menu, X, BarChart2, PlusCircle, LogOut, ClipboardList, Printer, Trash2, Edit, KeyRound, MinusCircle, FileText } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, deleteDoc, writeBatch, updateDoc, increment } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

// =================================================================================
// COLE AQUI A CONFIGURAÇÃO DO SEU FIREBASE
// ================================================================================
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
    const [email, setEmail] = useState('');shete(true [password, setPassword] = useState('');attte([]); [error, setError] = useState('');ssee:(() => handleLogin uoadAll (e)a = asyncdin; e.preventDefault();
        setError('');t = awaisync (type, datry dataTo signInWithEmailAndPassword(auth, email, password);c(doc(db), d if(onLogin) onLogin();   await acollec (err) t conardD;teI setError('Email ou senha inválidos.');sync   itemRncrement(amount)
    ha login:", err); //d(t {    up}), ave(;
    s ({clientsnt-medium">{label}</s items-center justify-centerpan> </li bg-gray-100"> h-scr-300 ese-in className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">order-graytext-b <div className="text-center"> => setIn(falseton>
 <h1 className="text-3xl font-bold text-blue-600">OficinaPRO</h1>/div>
      on={<Bar <p className="mt-2 text-gray-500">Acesso restrito</p>ts" icon={<Ules"-medium">Sair     de>
  <form className="space-y-6" onSubmit={handleLogin}>justify-be setIsMent <div><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 text-gray-700shboardts }) {
   ervices.filter(s => {
        const serviceDate = new Date(s.date);
        const today = new Date();
        return serviceDate.getMonth() === today.getMonth() && serviceDate.getFullYear() === today.getFullYear();
    }).length;

    const StatCard = ({ title, value, icon, color }) => ( <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center justify-between transition-transform hover:scale-105"> <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p></div> <div className={`p-3 rounded-full ${color}`}>{icon}</div> </div> );
    return ( <div className="animate-fade-in"> <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Dashboard</h2> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> <StatCard title="Total de Clientes" value={clients.length} icon={<Users className="text-white" />} color="bg-blue-500" /> <StatCard title="Serviços no Mês" value={servicesThisMonth} icon={<Car className="text-white" />} color="bg-green-500" /> <StatCard title="Serviços em Andamento" value={services.filter(s => s.status === 'Em andamento').length} icon={<Wrench className="text-white" />} color="bg-yellow-500" /> <StatCard title="Orçamentos Pendentes" value={budgets.filter(b => b.status === 'Pendente').length} icon={<ClipboardList className="text-white" />} color="bg-indigo-500" /> </div> </div> );
}

function GenericView({ title, columns, data, renderRow, onAddItem, children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredData = data.filter(item => Object.entries(item).some(([key, value]) => key !== 'id' && String(value).toLowerCase().includes(searchTerm.toLowerCase())) );
  return ( <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg animate-fade-in"> <div className="flex flex-col md:flex-row justify-between items-center mb-6"> <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">{title}</h2> <div className="w-full md:w-auto flex items-center space-x-4"> <input type="text" placeholder="Buscar..." className="w-full md:w-64 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> {onAddItem && <button onClick={onAddItem} className="flex items-center justify-center p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-transform hover:scale-110 shadow"><PlusCircle size={24}/></button>} </div> </div> {children} <div className="overflow-x-auto"><table className="w-full text-left"> <thead className="bg-gray-100 dark:bg-gray-700"><tr> {columns.map((col, index) => <th key={index} className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-sm">{col}</th>)} <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-sm text-right">Ações</th> </tr></thead> <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{filteredData.map(item => renderRow(item))}</tbody> </table>{filteredData.length === 0 && <div className="text-center py-10"><p className="text-gray-500 dark:text-gray-400">Nenhum item encontrado.</p></div>}</div> </div> );
}

function Clients({ clients, openModal, handleDelete }) { /* ...código do componente (sem alterações)... */ }

function Vehicles({ vehicles, clients, openModal, handleDelete }) { /* ...código do componente (sem alterações)... */ }

function Services({ services, clients, vehicles }) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const getClientName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const client = clients.find(c => c.id === vehicle?.clientId);
    return client?.name || 'N/A';
  };
  const filteredServices = services.filter(service => {
    if (!selectedClientId) return true;
    const vehicle = vehicles.find(v => v.id === service.vehicleId);
    return vehicle?.clientId === selectedClientId;
  });
  const columns = ['O.S #', 'Cliente', 'Veículo', 'Data', 'Preço', 'Status'];
  const renderRow = (service) => ( <tr key={service.id}> <td className="p-4 font-bold">#{service.budgetId.substring(0,5)}</td> <td>{getClientName(service.vehicleId)}</td> <td>{service.vehicleModel}</td> <td>{service.date}</td> <td>R$ {service.totalPrice.toFixed(2)}</td> <td><span className={`px-3 py-1 text-sm font-medium rounded-full ${service.status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{service.status}</span></td> <td className="p-4 text-right"><button className="text-blue-500 hover:text-blue-700">Detalhes</button></td> </tr> );
  return ( <GenericView title="Ordens de Serviço" columns={columns} data={filteredServices} renderRow={renderRow}> <div className="mb-4"> <label className="mr-2">Filtrar por Cliente:</label> <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="p-2 border rounded-md"> <option value="">Todos os Clientes</option> {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)} </select> </div> </GenericView> );
}

function Budgets({ budgets, clients, vehicles, handleApproveBudget, openModal, handleDelete }) { /* ...código do componente (sem alterações)... */ }

function Finance({ services, expenses, onSave, handleDelete }) { /* ...código do componente (sem alterações)... */ }

function Inventory({ inventory, openModal, handleDelete, handleUpdateInventoryQuantity }) {
    const columns = ["Material", "Marca", "Aplicação", "Quantidade", "Ajuste Rápido"];
    const renderRow = (item) => (
        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td className="p-4">{item.materialType}</td>
            <td className="p-4">{item.brand}</td>
            <td className="p-4">{item.application}</td>
            <td className="p-4 font-bold">{item.quantity}</td>
            <td className="p-4 space-x-2">
                <button onClick={() => handleUpdateInventoryQuantity(item.id, 1)} className="p-1 bg-green-500 text-white rounded-full"><PlusCircle size={18}/></button>
                <button onClick={() => handleUpdateInventoryQuantity(item.id, -1)} className="p-1 bg-red-500 text-white rounded-full"><MinusCircle size={18}/></button>
            </td>
            <td className="p-4 text-right space-x-2">
                <button onClick={() => openModal('inventory', item)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={18}/></button>
                <button onClick={() => handleDelete('inventory', item.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18}/></button>
            </td>
        </tr>
    );
    return <GenericView title="Estoque de Peças" columns={columns} data={inventory} renderRow={renderRow} onAddItem={() => openModal('inventory')} />;
}

function Reports({ services, clients, vehicles }) {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const getClientName = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        const client = clients.find(c => c.id === vehicle?.clientId);
        return client?.name || 'N/A';
    };

    const monthlyServices = services.filter(s => {
        const serviceDate = new Date(s.date);
        return serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear;
    });

    return (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Relatório de Serviços Mensal</h2>
            <p className="mb-4">Exibindo {monthlyServices.length} serviço(s) para o mês {currentMonth + 1}/{currentYear}.</p>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="p-4">Data</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Veículo</th>
                            <th className="p-4">Descrição</th>
                            <th className="p-4 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {monthlyServices.map(s => (
                            <tr key={s.id}>
                                <td className="p-4">{s.date}</td>
                                <td className="p-4">{getClientName(s.vehicleId)}</td>
                                <td className="p-4">{s.vehicleModel}</td>
                                <td className="p-4">{s.description}</td>
                                <td className="p-4 text-right">R$ {s.totalPrice.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Modal({ title, onClose, children }) { /* ...código do componente (sem alterações)... */ }

function ClientEditor({ client, onSave, onClose }) {
    const [data, setData] = useState({ id: null, name: '', phone: '', email: '' });
    useEffect(() => { if (client) setData(client); else setData({ id: null, name: '', phone: '', email: '' }); }, [client]);
    const handleChange = (e) => setData({...data, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(data); };
    return ( <Modal title={client ? 'Editar Cliente' : 'Novo Cliente'} onClose={onClose}> <form onSubmit={handleSubmit} className="p-6 space-y-4"> <div><label>Nome</label><input name="name" value={data.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div> <div><label>Telefone</label><input name="phone" value={data.phone} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div> <div><label>Email</label><input type="email" name="email" value={data.email} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div> <div className="pt-4 flex justify-end"><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button></div> </form> </Modal> );
}

function VehicleEditor({ vehicle, clients, onSave, onClose }) { /* ...código do componente (sem alterações)... */ }

function InventoryEditor({ item, onSave, onClose }) {
    const [data, setData] = useState({ id: null, materialType: '', brand: '', application: '', quantity: 0 });
    useEffect(() => { if (item) setData(item); else setData({ id: null, materialType: '', brand: '', application: '', quantity: 0 }); }, [item]);
    const handleChange = (e) => setData({...data, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(data); };
    return (
        <Modal title={item ? 'Editar Item do Estoque' : 'Novo Item no Estoque'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label>Tipo de Material</label><input name="materialType" value={data.materialType} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div>
                <div><label>Marca</label><input name="brand" value={data.brand} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div>
                <div><label>Veículo Aplicado</label><input name="application" value={data.application} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div>
                <div><label>Quantidade</label><input type="number" name="quantity" value={data.quantity} onChange={(e) => setData({...data, quantity: parseInt(e.target.value, 10) || 0})} className="w-full mt-1 p-2 border rounded-md" required /></div>
                <div className="pt-4 flex justify-end"><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button></div>
            </form>
        </Modal>
    );
}

function BudgetEditor({ budget, clients, vehicles, onSave, onClose }) { /* ...código do componente (sem alterações)... */ }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
