import React, { useState } from 'react';
import Head from 'next/head';
import ModalPropsAlert from '@/components/Modals/ModalPropsAlert';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  slug: string;
  titleBar: string;
}

const MainLayouts: React.FC<LayoutProps> = ({ children, title, description, slug, titleBar }) => {


  const defaultTitle = 'DemoAssist';
  const defaultDescription = 'DemoAssist';



  return (
    <>
      <Head>
        <title>{title ? `${title} | ${defaultTitle}` : defaultTitle}</title>
        <meta name="description" content={description || defaultDescription} />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {children}
      <ModalPropsAlert />
    </>
  );
};

export default MainLayouts;
