import { buildPaginationMeta, toPaginatedResult } from './pagination.util.js';

describe('pagination.util', () => {
  it('menghitung metadata pagination', () => {
    expect(buildPaginationMeta(25, 2, 10)).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it('menangani hasil kosong', () => {
    expect(buildPaginationMeta(0, 1, 10)).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it('membungkus data dan metadata', () => {
    expect(toPaginatedResult(['a'], 1, 1, 10)).toEqual({
      data: ['a'],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });
});
