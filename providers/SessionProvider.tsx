"use client";import { SessionProvider as P } from 'next-auth/react';export default function S({children}:{children:React.ReactNode}){return <P>{children}</P>}
