interface ObjectWithKeys {
  [key: string]: any;
}

interface FilteredObject {
  [key: string]: any;
}

interface MongoosePaginationOptions {
  page?: number;
  limit?: number;
  customLabels?: Record<string, string>;
  pagination: boolean;
}

interface PaginatedPayload<T> {
  page: number;
  limit: number;
  totalPages: number;
  previousPage: boolean;
  nextPage: boolean;
  totalItems: number;
  currentPageItems: number | undefined;
  data: T[];
}

export const filterObjectKeys = (
  fieldsArray: string[],
  objectArray: ObjectWithKeys[]
): FilteredObject => {
  const filteredArray = structuredClone(objectArray).map((originalObj) => {
    let obj: FilteredObject = {};
    structuredClone(fieldsArray)?.forEach((field) => {
      if (field?.trim() in originalObj) {
        obj[field] = originalObj[field];
      }
    });
    if (Object.keys(obj).length > 0) return obj;
    return originalObj;
  });
  return filteredArray;
};

export default function getPaginatedPayload<T>(
  dataArray: T[],
  page: number,
  limit: number
): PaginatedPayload<T> {
  const startPosition = +(page - 1) * limit;

  const totalItems = dataArray.length;
  const totalPages = Math.ceil(totalItems / limit);

  dataArray = structuredClone(dataArray).slice(
    startPosition,
    startPosition + limit
  );

  const payload = {
    page,
    limit,
    totalPages,
    previousPage: page > 1,
    nextPage: page < totalPages,
    totalItems,
    currentPageItems: dataArray?.length,
    data: dataArray,
  };
  return payload;
}

export const getMongoosePaginationOptions = ({
  page = 1,
  limit = 10,
  customLabels,
}: MongoosePaginationOptions): MongoosePaginationOptions => {
  return {
    page: Math.max(page, 1),
    limit: Math.max(limit, 1),
    pagination: true,
    customLabels: {
      pagingCounter: "serialNumberStartFrom",
      ...customLabels,
    },
  };
};

export const getRandomNumber = (max: number) => {
  return Math.floor(Math.random() * max);
};
