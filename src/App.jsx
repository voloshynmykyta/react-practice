/* eslint-disable jsx-a11y/accessible-emoji */
import { React, useState } from 'react';
import cn from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    cat => cat.id === product.categoryId,
  );
  const user = usersFromServer.find(usr => usr.id === category.ownerId);

  return {
    ...product,
    category,
    user,
  };
});

const SORT_BY_ID_FIELD = 'ID';
const SORT_BY_PRODUCT_FIELD = 'Product';
const SORT_BY_CATEGORY_FIELD = 'Category';
const SORT_BY_USER_FIELD = 'User';

const SORTERS = {
  [SORT_BY_ID_FIELD]: (productA, productB) => productA.id - productB.id,
  [SORT_BY_PRODUCT_FIELD]: (productA, productB) =>
    productA.name.localeCompare(productB.name),
  [SORT_BY_CATEGORY_FIELD]: (productA, productB) =>
    productA.category.title.localeCompare(productB.category.title),
  [SORT_BY_USER_FIELD]: (productA, productB) =>
    productA.user.name.localeCompare(productB.user.name),
};

const HEADERS = [
  SORT_BY_ID_FIELD,
  SORT_BY_PRODUCT_FIELD,
  SORT_BY_CATEGORY_FIELD,
  SORT_BY_USER_FIELD,
];

export const App = () => {
  const [selectedUser, setSelectedUser] = useState({});
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortField, setSortField] = useState('');
  const [isReversed, setIsReversed] = useState(false);

  const filteredProducts = () => {
    let copiedProducts = [...products];

    if (selectedUser.id) {
      copiedProducts = copiedProducts.filter(
        product => product.user.id === selectedUser.id,
      );
    }

    if (filterQuery.length) {
      const normalized = filterQuery.trim().toLowerCase();

      copiedProducts = copiedProducts.filter(product => {
        return product.name.toLowerCase().includes(normalized);
      });
    }

    if (selectedCategories.length) {
      const selectedCategoriesIds = selectedCategories.map(
        category => category.id,
      );

      copiedProducts = copiedProducts.filter(product => {
        return selectedCategoriesIds.includes(product.category.id);
      });
    }

    if (sortField && SORTERS[sortField]) {
      copiedProducts = copiedProducts.toSorted(SORTERS[sortField]);
    }

    if (isReversed) {
      copiedProducts = copiedProducts.toReversed();
    }

    return copiedProducts;
  };

  const handleResetFilters = () => {
    setSelectedUser({});
    setFilterQuery('');
    setSelectedCategories([]);
  };

  const handleSelectCategory = currentCategory => {
    const hasSelectedCategory = selectedCategories.find(
      category => category.id === currentCategory.id,
    );

    if (hasSelectedCategory) {
      setSelectedCategories(prev => {
        return prev.filter(category => category.id !== currentCategory.id);
      });
    } else {
      setSelectedCategories(prev => [...prev, currentCategory]);
    }
  };

  const handleHeaderClick = header => {
    if (sortField === header) {
      if (!isReversed) {
        setIsReversed(true);
      } else {
        setSortField('');
        setIsReversed(false);
      }
    } else {
      setSortField(header);
      setIsReversed(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': !selectedUser.id })}
                onClick={() => {
                  setSelectedUser({});
                }}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({ 'is-active': selectedUser.id === user.id })}
                  onClick={() => {
                    setSelectedUser(user);
                  }}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={filterQuery}
                  onChange={e => {
                    setFilterQuery(e.target.value);
                  }}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {filterQuery.length > 0 && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => {
                        setFilterQuery('');
                      }}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length,
                })}
                onClick={() => {
                  setSelectedCategories([]);
                }}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category),
                  })}
                  href="#/"
                  onClick={() => {
                    handleSelectCategory(category);
                  }}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  handleResetFilters();
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {filteredProducts().length > 0 ? (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {HEADERS.map(header => (
                    <th key={header}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {header}
                        <a
                          href="#/"
                          onClick={() => {
                            handleHeaderClick(header);
                          }}
                        >
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn('fas', {
                                'fa-sort': sortField !== header,
                                'fa-sort-up':
                                  sortField === header && !isReversed,
                                'fa-sort-down':
                                  sortField === header && isReversed,
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredProducts().map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">{`${product.category.icon} - ${product.category.title}`}</td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': product.user.sex === 'm',
                        'has-text-danger': product.user.sex === 'f',
                      })}
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
