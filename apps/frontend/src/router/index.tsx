import { lazy } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';

const Layout = lazy(() => import('../components/layout/index.tsx'));
const Chat = lazy(() => import('../pages/chat/index.tsx'));
const Purchase = lazy(() => import('../pages/purchase/index.tsx'));
const Login = lazy(() => import('../pages/login/index.tsx'));
import Index from '../pages/index.tsx';

const routes: RouteObject[] = [
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Index />,
            },
            {
                path: 'chat/:id',
                element: <Chat />,
            },
            {
                path: 'purchase',
                element: <Purchase />,
            },
        ],
    },
    {
        path: '/login',
        element: <Login />,
    },
];

export const router = createBrowserRouter(routes);
