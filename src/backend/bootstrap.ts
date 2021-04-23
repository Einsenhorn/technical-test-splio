import http from 'http';
import url from 'url';

export default () => {
    const test = new url.URL('https://raw.githubusercontent.com/NABSA/gbfs/master/systems.csv');

    console.log(test);
};
