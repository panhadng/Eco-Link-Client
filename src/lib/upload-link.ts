import { ApolloLink, Observable } from '@apollo/client';
import { print } from 'graphql';

export interface UploadLinkOptions {
  uri: string;
  headers?: Record<string, string>;
}

// Simple file extraction without external dependencies
function extractFiles(obj: unknown, path = '', files = new Map<File, string[]>): unknown {
  if (obj instanceof File) {
    const currentPaths = files.get(obj) || [];
    files.set(obj, [...currentPaths, path]);
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, i) => extractFiles(item, `${path}.${i}`, files));
  }

  if (obj && typeof obj === 'object' && !(obj instanceof File)) {
    const clone: Record<string, unknown> = {};
    for (const key in obj) {
      clone[key] = extractFiles(obj[key as keyof typeof obj], path ? `${path}.${key}` : key, files);
    }
    return clone;
  }

  return obj;
}

export const createUploadLink = (options: UploadLinkOptions) => {
  return new ApolloLink((operation, forward) => {
    const context = operation.getContext();
    
    return new Observable((observer) => {
      const files = new Map();
      const clone = extractFiles(operation.variables, 'variables', files);
      
      // If no files, use standard JSON request
      if (files.size === 0) {
        fetch(options.uri, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...context.headers,
          },
          body: JSON.stringify({
            query: print(operation.query),
            variables: operation.variables,
            operationName: operation.operationName,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((result) => {
            observer.next(result);
            observer.complete();
          })
          .catch((error) => {
            observer.error(error);
          });
        return;
      }

      // Prepare FormData for file upload (order matters: operations, map, then files)
      const formData = new FormData();
      
      const operations = {
        query: print(operation.query),
        variables: clone,
        operationName: operation.operationName,
      };
      
      formData.append('operations', JSON.stringify(operations));
      
      const map: Record<string, string[]> = {};
      let i = 0;
      files.forEach((paths) => {
        map[i.toString()] = paths;
        i++;
      });
      formData.append('map', JSON.stringify(map));
      
      // Now append files AFTER map
      i = 0;
      files.forEach((paths, file) => {
        formData.append(i.toString(), file as File);
        i++;
      });

      // Make the request (don't set Content-Type for FormData, browser will set it with boundary)
      const headers = { ...context.headers };
      delete headers['Content-Type']; // Let browser set it for multipart/form-data
      
      fetch(options.uri, {
        method: 'POST',
        headers,
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  });
};

