import React, { useMemo, useState } from 'react';
import CustomerModal from '../components/CustomerModal';
import { ChatIcon, PencilIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { PROJECTS } from '../services/mockData';
import { Branch, Customer, WhatsAppSettings } from '../types';

interface CustomersProps {
    customers: Customer[];
    onSave: (customer: Customer) => void;
    whatsappSettings: WhatsAppSettings;
    branches: Branch[];
}

const Customers: React.FC<CustomersProps> = ({ customers, onSave, whatsappSettings, branches }) => {
    const { addToast } = useToasts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isWhatsappModalOpen, setWhatsappModalOpen] = useState(false);
    const [customerForWhatsapp, setCustomerForWhatsapp] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [projectFilter, setProjectFilter] = useState<string>('all');

    const handleSave = (customer: Customer) => {
        onSave(customer);
        setIsModalOpen(false);
        setSelectedCustomer(null);
        addToast(`Customer ${customer.id ? 'updated' : 'added'} successfully!`, 'success');
    };

    const handleAddNew = () => {
        setSelectedCustomer({} as Customer);
        setIsModalOpen(true);
    };
    
    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };
    
    const handleOpenWhatsappModal = (customer: Customer) => {
        setCustomerForWhatsapp(customer);
        setWhatsappModalOpen(true);
    };

    const getProjectName = (projectId?: number) => {
        if (!projectId) return 'N/A';
        return PROJECTS.find(p => p.id === projectId)?.name || 'غير معروف';
    };

    const getBranchName = (branchId?: number) => {
        if (!branchId) return 'N/A';
        return branches.find(b => b.id === branchId)?.name || 'غير معروف';
    };

    const formatBalance = (balance: number) => {
        const color = balance > 0 ? '#ef4444' : balance < 0 ? '#10b981' : 'var(--text-primary)';
        const text = balance > 0 ? `مدين بـ ${balance.toLocaleString()}` : balance < 0 ? `دائن بـ ${(-balance).toLocaleString()}` : 'لا يوجد رصيد';
        return <span style={{ color, fontWeight: 600 }}>{text}</span>;
    };

    const filteredCustomers = useMemo(() => {
        let filtered = customers;

        // Apply project filter
        if (projectFilter !== 'all') {
            filtered = filtered.filter(customer => customer.projectId === parseInt(projectFilter, 10));
        }

        // Apply search filter on top of project filter
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(customer =>
                customer.name.toLowerCase().includes(lowercasedFilter) ||
                customer.phone.toLowerCase().includes(lowercasedFilter)
            );
        }
        
        return filtered;
    }, [searchTerm, customers, projectFilter]);

    return (
        <>
            <div className="glass-pane customers-container" style={{ padding: '1.5rem' }}>
                <div className="customers-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="customers-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>إدارة العملاء</h3>
                     <div className="customers-filters" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو الهاتف..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="form-input customers-search"
                            style={{ width: '250px' }}
                        />
                        <select
                            value={projectFilter}
                            onChange={e => setProjectFilter(e.target.value)}
                            className="form-select customers-filter"
                            style={{ width: '200px' }}
                        >
                            <option value="all">كل المشاريع</option>
                            {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="customers-actions">
                            <button onClick={handleAddNew} className="btn btn-primary customers-button">
                                إضافة عميل جديد
                            </button>
                        </div>
                    </div>
                </div>
                <div className="customers-table-wrapper table-wrapper">
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>الهاتف</th>
                                <th>المشروع</th>
                                <th>الفرع</th>
                                <th>أضيف بواسطة</th>
                                <th>الرصيد</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(c => (
                                <tr key={c.id}>
                                    <td>{c.name}</td>
                                    <td>{c.phone}</td>
                                    <td>{getProjectName(c.projectId)}</td>
                                    <td>{getBranchName(c.branchId)}</td>
                                    <td>{c.addedBy}</td>
                                    <td className="customers-balance">{formatBalance(c.balance)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEdit(c)} style={{color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}} title="تعديل"><PencilIcon style={{width:'20px', height:'20px'}}/></button>
                                            {whatsappSettings.isEnabled && c.id !== 4 && (
                                                <button onClick={() => handleOpenWhatsappModal(c)} style={{color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}} title="إرسال رسالة واتساب"><ChatIcon style={{width:'20px', height:'20px'}}/></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <CustomerModal 
                    customer={selectedCustomer}
                    onClose={() => { setIsModalOpen(false); setSelectedCustomer(null); }}
                    onSave={handleSave}
                    branches={branches}
                    existingCustomers={customers}
                />
            )}
             {isWhatsappModalOpen && customerForWhatsapp && (
                <WhatsAppModal
                    customer={customerForWhatsapp}
                    onClose={() => setWhatsappModalOpen(false)}
                    settings={whatsappSettings}
                />
            )}
        </>
    );
};

// --- WhatsApp Modal Component ---
const WhatsAppModal: React.FC<{customer: Customer, onClose: () => void, settings: WhatsAppSettings}> = ({ customer, onClose, settings }) => {
    const { addToast } = useToasts();
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (!message.trim()) {
            addToast('لا يمكن إرسال رسالة فارغة.', 'error');
            return;
        }
        // This is a simulation of a real API call.
        console.group("WhatsApp API Call Simulation");
        console.log("Endpoint:", `https://graph.facebook.com/vXX.X/${settings.phoneNumberId}/messages`);
        console.log("Authorization:", `Bearer ${settings.apiKey}`);
        console.log("Recipient:", customer.phone);
        console.log("Message:", message);
        console.groupEnd();

        addToast(`تم إرسال الرسالة إلى ${customer.name} (محاكاة).`, 'success');
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content glass-pane" onClick={e => e.stopPropagation()} style={{ maxWidth: '40rem' }}>
                <div className="modal-header">
                    <h2 style={{fontSize: '1.5rem', fontWeight: 600}}>إرسال رسالة واتساب</h2>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p><strong>إلى:</strong> {customer.name} ({customer.phone})</p>
                    <div>
                        <label className="form-label">محتوى الرسالة</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="form-input"
                            rows={5}
                            placeholder="اكتب رسالتك الترويجية هنا..."
                        />
                    </div>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
                    <button onClick={handleSend} className="btn btn-secondary">إرسال</button>
                </div>
            </div>
        </div>
    );
};

export default Customers;