import { GetServerSideProps } from 'next';
import { parse } from 'cookie';
const withCommonData = (customData: LayoutMetaProps): GetServerSideProps => async (context) => {
    const rawCookies = context.req.headers.cookie || '';
    const cookies = parse(rawCookies);
    return {
        props: {
            title: customData.title,
            description: customData.description,
            slug: customData.slug,
            titleBar: customData.titleBar,
            cookies
        },
    };
};

export default withCommonData