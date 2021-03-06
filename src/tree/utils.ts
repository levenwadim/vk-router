import { NavigatorRoute } from '..';
import RouteNode from './RouteNode';

export const removeTrailingSlash = (string: string) => string.replace(/\/$/, '');

export const isWindow = () => typeof window !== 'undefined' && window !== null;

export const isObject = (obj: any) => (typeof obj === 'object' || typeof obj === 'function') && (obj !== null);

export const set = (obj: Record<string, any>, path: string, value: any) => {
  const pList = Array.isArray(path) ? path : path ? path.split('.') : [];
  const len = pList.length;

  for (let i = 0; i < len - 1; i++) {
    const elem = pList[i];
    if (!obj[elem] || !isObject(obj[elem])) {
      obj[elem] = {} as Record<string, any>;
    }
    obj = obj[elem];
  }

  obj[pList[len - 1]] = value;
};

export const getUrlParams = (url: string) => {
  const decodedQueryString: Record<string, any> = {};
  const processedString = url.slice(url.indexOf('?') + 1);
  const queryStringPieces = processedString ? processedString.split('&') : [];

  for (const piece of queryStringPieces) {
    let [key, value] = piece.split('=');
    value = value || '';
    set(decodedQueryString, key, value);
  }

  return decodedQueryString;
};

export const restoreParams = (params: any) => {
  if (!params || typeof params !== 'object') {
    return {};
  }

  const restoredParams: any = {};

  for (const [keyOrPath, value] of Object.entries(params)) {
    set(restoredParams, keyOrPath, value);
  }

  return restoredParams;
};

export const buildPathFromDotPath = (path: string) => path ? '/' + path.split('.').join('/') : '';

export const getParentPath = (path: string) => {
  const segments = path.split('.');
  segments.splice(-1, 1);
  const joiner = segments.length ? '.' : '';
  return segments.join(joiner);
};

export const isPath = (name: string) => name.includes('.');

const getPathSegments = (pathToRoute: string) => {
  const segments = pathToRoute.split('.');
  let routePath = '';
  const pathSegments = segments.map((segment: string, idx: number) => {
    routePath += !idx ? segment : `.${segment}`;
    return routePath;
  });

  return pathSegments;
};

export const getByPath = (routes: NavigatorRoute[] | RouteNode[], pathToRoute: string) => {
  const segments = getPathSegments(pathToRoute);
  const stack = [...routes];
  let resultNode: RouteNode | null = null;
  while (stack.length && segments.length) {
    const route = stack.shift();
    const [segment] = segments;
    if (route.name === segment) {
      if (segments.length > 1) {
        stack.push(...route.children);
        segments.shift();
        continue;
      } else if (segments.length === 1) {
        resultNode = route;
        break;
      }
    }
  }

  return resultNode;
};
