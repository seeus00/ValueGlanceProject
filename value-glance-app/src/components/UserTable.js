import { useEffect, useState } from 'react';

//Create a separate functional component to display the table's contents
const TableContent = ({entries, columns}) => {
  return (
    <tbody>
      {entries.map(entry => (
        <tr 
          key={entry.acceptedDate}
          className='text-slate-400'
          >
          {columns.map(column => (
            <td 
              key={column} 
              className='break-all table-cell'
              >{entry[column]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
};

//Creates a separate functional component for the header cells for each of the columns 
const TableHeaderCell = ({ column, sorting, sortTable, supportedSortingColumns }) => {
  const isDescSorting = sorting.column === column && sorting.order === "desc";
  const isAscSorting = sorting.column === column && sorting.order === "asc";
  const futureSortingOrder = isDescSorting ? "asc" : "desc";

  if (!supportedSortingColumns.includes(column)) {
    return (
      <th
        className='border-b border-blue-gray-100 bg-blue-gray-10 text-white'
        key={column}
      >
        {column}
      </th>
    );
  }

  return (
    <th
      className='border-b border-blue-gray-100 bg-blue-gray-50 text-white'
      key={column}
      onClick={() => sortTable({ column, order: futureSortingOrder })}
    >
      {column}
      {isDescSorting && <span>▼</span>}
      {isAscSorting && <span>▲</span>}
    </th>
  );
};

//Creates a separate functional component for the clickable sortable columns 
const TableHeader = ({ columns, sorting, sortTable, supportedSortingColumns }) => {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <TableHeaderCell
            column={column}
            sorting={sorting}
            key={column}
            sortTable={sortTable}
            supportedSortingColumns={supportedSortingColumns}
          />
        ))}
      </tr>
    </thead>
  );
};

//Creates a functional component for the search bar and handles form submission
const SearchBar = ({ searchTable }) => {
  const [searchValue, setSearchValue] = useState("");
  const submitForm = (e) => {
    e.preventDefault();
    searchTable(searchValue);
  };

  return (
    <div className="search-bar">
      <form id="search-form" onSubmit={submitForm}>
        <input
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>
      <button
        className='py-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' 
        type="submit" 
        form="search-form" 
        value="Submit">Submit</button>
    </div>
  );
};


const API_KEY = process.env.REACT_API_KEY;

const UserTable = () => {
  //Default sorting is by date and in ascending order
  const [sorting, setSorting] = useState({ column: "date", order: "asc" });
  const [tableData, setTableData] = useState([]);
  
  const resetTable = async () => {
    const apiUrl = `https://financialmodelingprep.com/api/v3/income-statement/AAPL?period=annual&apikey=${API_KEY}`;
    const jsonData = await (await fetch(apiUrl)).json();

    setTableData(jsonData);
  };

  useEffect(() => {
    resetTable();
  }, []);

  useEffect(() => {}, [tableData]);

  const columns = ['date', 'revenue', 'netIncome', 'grossProfit', 'eps', 'operatingIncome'];
  const sortColumns = ['date', 'revenue', 'netIncome'];



  const sortTable = (newSorting) => {
    setSorting(newSorting);

    const header = newSorting.column;
    const sortingOrder = newSorting.order === "asc" ? -1 : 1;

    const newData = [...tableData].sort((a, b) => (a[header] > b[header] ? sortingOrder : -sortingOrder));
    setTableData(newData);
  };

  const searchTable = (newSearchValue) => {
    //Query needs to be in this format: "column: num-num"
    const split = newSearchValue.split(':');
    if (split.length < 2 || split.length > 2) return;

    const column = split[0].trim();
    if (!sortColumns.includes(column)) return;

    //Range should be two numbers
    const rangeSplit = split[1].split("-");
    if (rangeSplit.length < 2 || rangeSplit.length > 2) return;

    const minRange = parseInt(rangeSplit[0]);
    const maxRange = parseInt(rangeSplit[1]);

    if (isNaN(minRange) || isNaN(maxRange)) return;

    let newData = null;

    //Date should be filtered manually to extract year from the date string
    if (column === "date") {
      newData = tableData.filter(data => new Date(data[column]).getFullYear() >= minRange 
                    && new Date(data[column]).getFullYear() <= maxRange);
    }else {
      newData = tableData.filter(data => data[column] >= minRange && data[column] <= maxRange);
    }

    setTableData(newData);
  };

  return (
  <div className='p-5 relative flex flex-col w-full h-full min-h-screen flex flex-col'>
    <SearchBar searchTable={searchTable}/>
    
    <table className='m-4 w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 table-layout:auto'>
      <TableHeader columns={columns} sorting={sorting} sortTable={sortTable} supportedSortingColumns={sortColumns}/>
      <TableContent entries={tableData} columns={columns} />
    </table>
    <div>
      <button type="button" onClick={resetTable} className="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Reset</button>
    </div>
  </div>
  )
}

export default UserTable;