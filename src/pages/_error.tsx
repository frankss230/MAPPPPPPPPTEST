import React from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';

interface ErrorProps {
  statusCode: number;
}

const ErrorPage: React.FC<ErrorProps> = ({ statusCode }) => {
  const message =
    statusCode === 404
      ? 'The page you are looking for was not found.'
      : 'An error occurred. Please try again.';

  return (
    <div className="text-center mt-10">
      <h1 className="text-4xl">{statusCode || 'Error'}</h1>
      <p className="text-xl mt-4">{message}</p>
      <Link href="/" className="text-blue-500 mt-4 inline-block">
          Go back to the homepage
      </Link>
    </div>
  );
};

// ErrorPage.getInitialProps = ({ res, err }) => {
//   const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
//   return { statusCode };
// };
export const getServerSideProps: GetServerSideProps<ErrorProps> = async ({ res, err }:any) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { props: { statusCode } };
  };

export default ErrorPage;
