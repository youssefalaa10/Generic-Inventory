import React, { useState, useContext, ChangeEvent } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthContext } from '../App';
import { RenewableItem, RenewableData } from '../types';
import { SparklesIcon, EyeIcon } from '../components/Icon';
import { useToasts } from '../components/Toast';
import { scanRenewableWithGemini } from '../services/geminiService';
import LicenseModal from '../components/LicenseModal';
import LicensePrintTemplate from '../components/LicensePrintTemplate';

interface LicensesProps {
    renewables: RenewableItem[];
    setRenewables: React.Dispatch<React.SetStateAction<RenewableItem[]>>;
    onCheckReminders: () => boolean;
}

const categoryTranslations: { [key: string]: string } = {
    'License': 'رخصة',
    'Vehicle': 'مركبة',
    'Permit': 'تصريح',
    'Subscription': 'اشتراك',
    'Other': 'أخرى'
};

const Licenses: React.FC<LicensesProps> = ({ renewables, setRenewables, onCheckReminders }) => {
    const { user } = useContext(AuthContext);
    const { addToast } = useToasts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Partial<RenewableItem> | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const hasPermission = (permission: 'create' | 'update' | 'delete') => {
        if (!user) return false;
        return user.permissions.includes(`licenses:${permission}`);
    };

    const getItemStatus = (expiryDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'منتهية', color: '#ef4444' };
        if (diffDays <= 30) return { text: `تنتهي خلال ${diffDays} يوم`, color: '#f59e0b' };
        return { text: 'نشطة', color: '#10b981' };
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        addToast('جاري مسح المستند بالذكاء الاصطناعي...', 'info');

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = (reader.result as string).split(',')[1];
                const mimeType = file.type;
                
                const extractedData: RenewableData = await scanRenewableWithGemini(base64Image, mimeType);
                
                setSelectedItem({ documentFile: file, ...extractedData });
                setIsModalOpen(true);
                addToast('تم مسح المستند بنجاح!', 'success');
            };
            reader.onerror = () => {
                 addToast('فشل في قراءة الملف.', 'error');
            }
        } catch (error) {
            console.error("Error scanning document:", error);
            addToast('خطأ في مسح المستند.', 'error');
        } finally {
            setIsScanning(false);
            if (event.target) event.target.value = '';
        }
    };
    
    const handleSave = (item: RenewableItem) => {
        setRenewables(prev => {
            const exists = prev.some(l => l.id === item.id);
            if (exists) {
                return prev.map(l => l.id === item.id ? item : l);
            }
            const newItem = { 
                ...item, 
                id: Math.max(...prev.map(l => l.id), 0) + 1,
                remindersSent: { d30: false, d15: false, d3: false }
            };
            return [...prev, newItem];
        });
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleManualCheck = () => {
        const remindersWereSent = onCheckReminders();
        if (!remindersWereSent) {
            addToast('No new reminders to send.', 'info');
        }
    };
    
    const handlePrint = (item: RenewableItem) => {
        const printArea = document.getElementById('print-area');
        if (!printArea) return;
        
        const root = ReactDOM.createRoot(printArea);
        root.render(<LicensePrintTemplate item={item} />);
        
        setTimeout(() => {
            window.print();
            root.unmount();
        }, 300);
    };

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>إدارة التجديدات والانتهاءات</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>تتبع الرخص، السيارات، الاشتراكات، وأي شيء له تاريخ انتهاء.</p>
                    </div>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                        <label className={`btn btn-warning ${isScanning ? 'opacity-50' : ''}`}>
                            <SparklesIcon style={{width: '20px', height: '20px'}}/>
                            <span>{isScanning ? 'جاري المسح...' : 'مسح مستند (AI)'}</span>
                            <input type="file" style={{ display: 'none' }} onChange={handleFileChange} disabled={isScanning} accept="image/png, image/jpeg, application/pdf" />
                        </label>
                        {hasPermission('create') && <button onClick={() => { setSelectedItem({}); setIsModalOpen(true); }} className="btn btn-primary">إضافة يدوية</button>}
                   </div>
                </div>
                
                <div className="glass-pane" style={{ padding: '1.5rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>قائمة العناصر</h3>
                        <button onClick={handleManualCheck} className="btn btn-ghost">التحقق من التذكيرات</button>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>الفئة</th>
                                    <th>الاسم</th>
                                    <th>المُعرّف</th>
                                    <th>تاريخ الانتهاء</th>
                                    <th>الحالة</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renewables.sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()).map(item => {
                                    const status = getItemStatus(item.expiryDate);
                                    return (
                                    <tr key={item.id}>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, borderRadius: '9999px',
                                                color: 'var(--text-secondary)', background: 'var(--surface-bg)', border: '1px solid var(--surface-border)'
                                            }}>
                                                {categoryTranslations[item.category] || item.category}
                                            </span>
                                        </td>
                                        <td style={{fontWeight: 600}}>{item.name}</td>
                                        <td>{item.identifier}</td>
                                        <td>{item.expiryDate}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'white', borderRadius: '9999px',
                                                background: status.color
                                            }}>
                                                {status.text}
                                            </span>
                                        </td>
                                        <td>
                                            <button onClick={() => { setSelectedItem(item); setIsModalOpen(true); }} style={{color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'}} title="عرض / تعديل">
                                                <EyeIcon style={{width:'20px', height:'20px'}}/>
                                            </button>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isModalOpen && selectedItem && (
                <LicenseModal 
                    item={selectedItem}
                    onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
                    onSave={handleSave}
                    onPrint={handlePrint}
                    hasPermission={hasPermission}
                />
            )}
        </>
    );
};

export default Licenses;