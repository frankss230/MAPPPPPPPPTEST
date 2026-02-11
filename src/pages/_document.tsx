import Document, { Html, Head, Main, NextScript } from 'next/document';


class MyDocument extends Document {
  static async getInitialProps(ctx:any) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html className="h-full">
        <Head>
        <link rel="icon" href="C:\SepawProject\SepawGit2\SEPAW-main\my-app\src\app\demoassist.ico" />
        </Head>
        <body className="">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
