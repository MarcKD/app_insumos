import React, { useMemo, useState } from 'react';
import { Package, LogIn } from 'lucide-react';
import { ALLOWED_ROLES, LOGIN_APP_NAME, loginUser } from '../src/services/authService';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const nextPath = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('next');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await loginUser({ username, password, next: nextPath });
        setIsLoading(false);

        if (!result.ok) {
            setError(result.message);
            return;
        }

        const { data } = result;
        const isAppAllowed = data?.appName === LOGIN_APP_NAME;

        if (!isAppAllowed) {
            setError('Tu usuario no está habilitado para acceder a esta aplicación.');
            return;
        }

        onLogin({
            name: data.display_name || data.username,
            username: data.username,
            userKind: data.user_kind,
            role: data.role,
            appName: data.appName,
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-blue-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Package className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">StockMaster</h1>
                    <p className="text-blue-100 text-sm mt-2">Gestión inteligente de insumos</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
                        <p><strong>Nombre de la App:</strong> {LOGIN_APP_NAME}</p>
                        <p><strong>Intentos permitidos:</strong> 3 fallidos antes de bloqueo.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="ej: jdoe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <LogIn size={20} />
                        {isLoading ? 'Validando...' : 'Ingresar al Sistema'}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        El acceso requiere rol SuperAdmin, Admin o Responsable.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
