export const load = ({ params }) => {
    console.log('Loader params:', params);
    return {
        slug: params.slug
    };
}; 