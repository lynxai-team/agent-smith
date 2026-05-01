import { useApi } from 'restmix';

const api = useApi({
    serverUrl: "http://localhost:5184/api"
});

export {
    api
};
