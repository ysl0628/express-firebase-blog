const convertPagination = (result, currentPage) => {
  const totalCount = result.length
  const pageLimit = 3
  const pages = Math.ceil(totalCount / pageLimit) // 總頁數

  const minItem = currentPage * pageLimit - pageLimit + 1
  const maxItem = currentPage * pageLimit
  const data = []
  result.forEach((item, i) => {
    let itemNum = i + 1
    if (itemNum >= minItem && itemNum <= maxItem) {
      data.push(item)
    }
  })

  const pagination = {
    totalCount,
    currentPage: currentPage > pages ? pages : currentPage,
    pages,
    hasPre: currentPage > 1,
    hasNext: currentPage < pages,
  }

  return { pagination, data }
}

module.exports = convertPagination
