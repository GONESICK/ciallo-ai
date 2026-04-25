import { Suspense } from 'react';
import { Outlet } from 'react-router';
import Sider from './Sider';

export default function Layout() {
    return (
        <div className="w-full h-svh bg-white">
            <div className="flex h-full">
                <Sider />
                <div className="flex-1 flex flex-col justify-center">
                    <Suspense fallback={null}>
                        <Outlet />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
