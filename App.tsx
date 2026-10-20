
import React, { useState, useEffect, useCallback } from 'react';
import { loadUserData } from './services/api';
import type { View, UserData, Utility } from './types';
import LoginScreen from './components/auth/LoginScreen';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import ProjectsView from './components/projects/ProjectsView';
import TransportView from './components/transport/TransportView';
import TaxesView from './components/taxes/TaxesView';
import UtilitiesView from './components/utilities/UtilitiesView';
import BenefitsView from './components/benefits/BenefitsView';
import type { Tax } from './types';


const Portal: React.FC<{ initialData: UserData }> = ({ initialData }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<View>('DASHBOARD');
    const [userData, setUserData] = useState<UserData>(initialData);

    useEffect(() => {
        // Simulate checking auth status and if user should be remembered
        const isRemembered = localStorage.getItem('rememberUser') === 'true';
        if (isRemembered) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = useCallback((rememberMe: boolean) => {
        setIsLoading(true);
        if (rememberMe) {
            localStorage.setItem('rememberUser', 'true');
        }
        setTimeout(() => {
            setIsLoggedIn(true);
            setIsLoading(false);
        }, 1500);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('rememberUser');
        setIsLoggedIn(false);
        setView('DASHBOARD');
    }, []);

    const handleTopUp = useCallback((amount: number) => {
        setUserData(prevData => ({
            ...prevData,
            transport: {
                ...prevData.transport,
                balance: prevData.transport.balance + amount
            }
        }));
    }, []);
    
    const handlePayTaxes = useCallback((taxIds: number[]) => {
      setUserData(prevData => {
          const newTaxes = prevData.taxes.map(tax => 
              taxIds.includes(tax.id) 
                ? { 
                    ...tax, 
                    status: 'Paid' as const, 
                    overdue: false, 
                    paymentDate: new Date().toLocaleDateString('en-GB') 
                  } 
                : tax
          );
          return { ...prevData, taxes: newTaxes };
      });
    }, []);

    const handlePayUtility = useCallback((utilityName: Utility['name']) => {
        setUserData(prevData => {
            const newUtilities = prevData.utilities.map(utility =>
                utility.name === utilityName ? { ...utility, status: 'Paid' as const, paymentDate: new Date().toLocaleDateString('en-GB') } : utility
            );
            return { ...prevData, utilities: newUtilities };
        });
    }, []);

    const handleToggleAutoPay = useCallback((utilityName: Utility['name']) => {
        setUserData(prevData => {
            const newUtilities = prevData.utilities.map(utility =>
                utility.name === utilityName ? { ...utility, autoPay: !utility.autoPay } : utility
            );
            return { ...prevData, utilities: newUtilities };
        });
    }, []);

    const renderView = () => {
        switch (view) {
            case 'DASHBOARD':
                return <Dashboard userData={userData} setView={setView} />;
            case 'PROJECTS':
                return <ProjectsView projects={userData.projects} />;
            case 'TRANSPORT':
                return <TransportView transport={userData.transport} onTopUp={handleTopUp} />;
            case 'TAXES':
                return <TaxesView taxes={userData.taxes} onPayTaxes={handlePayTaxes} />;
            case 'UTILITIES':
                return <UtilitiesView utilities={userData.utilities} onPayUtility={handlePayUtility} onToggleAutoPay={handleToggleAutoPay} />;
            case 'BENEFITS':
                return <BenefitsView benefits={userData.benefits} />;
            default:
                return <Dashboard userData={userData} setView={setView} />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-brand-primary">
                <div className="text-white text-2xl font-semibold animate-pulse">Loading Florești Civic Portal...</div>
            </div>
        );
    }
    
    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <Layout user={userData.user} activeView={view} setView={setView} onLogout={handleLogout}>
            {renderView()}
        </Layout>
    );
};

// Loads the data from the API first, then shows the portal.
const App: React.FC = () => {
    const [data, setData] = useState<UserData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUserData()
            .then(setData)
            .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-brand-primary p-6">
                <div className="text-white text-lg text-center">Could not load data from the Florești API. {error}</div>
            </div>
        );
    }
    if (!data) {
        return (
            <div className="flex items-center justify-center h-screen bg-brand-primary">
                <div className="text-white text-2xl font-semibold animate-pulse">Loading Florești Civic Portal...</div>
            </div>
        );
    }
    return <Portal initialData={data} />;
};

export default App;
