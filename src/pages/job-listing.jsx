import { getCompanies } from "@/api/apiCompanies";
import { getJobs } from "@/api/apiJobs";
import JobCard from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/useFetch";
import { useUser } from "@clerk/clerk-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState, useCallback } from "react";
import { BarLoader } from "react-spinners";
import { State } from "country-state-city";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import debounce from "lodash.debounce";

const ITEMS_PER_PAGE = 6;

const JobListing = () => {
  const { isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [company_id, setCompany_id] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    fn: fnJobs,
    data: dataJobs,
    loading: loadingJobs,
    error: errorJobs,
  } = useFetch(getJobs, { location, company_id, searchQuery });

  const { fn: fnCompanies, data: companies, loading: loadingCompanies } = useFetch(getCompanies);

  useEffect(() => {
    if (isLoaded) fnJobs();
  }, [isLoaded, location, company_id, searchQuery]);

  useEffect(() => {
    if (dataJobs) {
      const total = Math.ceil(dataJobs.length / ITEMS_PER_PAGE);
      setTotalPages(total);
    }
  }, [dataJobs]);

  useEffect(() => {
    if (isLoaded) fnCompanies();
  }, [isLoaded]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to the first page when search changes
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  const clearFilters = () => {
    setCompany_id("");
    setLocation("");
    setSearchQuery("");
    setCurrentPage(1); // Reset to the first page when filters are cleared
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setLoading(true); // Show loader while fetching data
      setCurrentPage(page);
      
      // Scroll to top smoothly
      document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Slice jobs based on the current page
  const paginatedJobs = dataJobs?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (loading && !loadingJobs) {
      setLoading(false); // Hide loader when data is loaded
    }
  }, [loadingJobs, loading]);

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-6xl sm:text-7xl, text-center pb-8">
        Latest Jobs
      </h1>

      {/* Add filters here */}

      <div className="h-14 flex w-full gap-2 items-center mb-3">
        <Input
          type="text"
          placeholder="Search Jobs by Title..."
          name="search-query"
          className="h-full flex-1 px-4 text-md"
          onChange={(e) => debouncedSearch(e.target.value)}
        />

        <Button type="button" className="h-full sm:w-28" variant="blue">
          Search
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {loadingCompanies ? (
          <BarLoader width={"100%"} color="#36d7b7" />
        ) : (
          <>
            <Select
              value={location}
              onValueChange={(value) => {
                setLocation(value);
                setCurrentPage(1); // Reset to the first page when location changes
              }}
              aria-label="Filter by Location"
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {State?.getStatesOfCountry("IN").map(({ name }) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={company_id}
              onValueChange={(value) => {
                setCompany_id(value);
                setCurrentPage(1); // Reset to the first page when company changes
              }}
              aria-label="Filter by Company"
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {companies?.map(({ name, id }) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              onClick={clearFilters}
              variant="destructive"
              className="sm:w-1/2"
            >
              Clear Filters
            </Button>
          </>
        )}
      </div>

      {loading && (
        <div className="mt-4">
          <BarLoader width={"100%"} color="#36d7b7" />
        </div>
      )}

      {errorJobs ? (
        <div className="mt-4 text-red-500">Error loading jobs. Please try again.</div>
      ) : (
        <>
          {loadingJobs === false && (
            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedJobs?.length > 0 ? (
                paginatedJobs.map((job) => (
                  <JobCard
                    savedInit={job?.saved?.length > 0}
                    key={job.id}
                    job={job}
                  />
                ))
              ) : (
                <div>No Jobs Found 😢</div>
              )}
            </div>
          )}

          {/* Pagination Component */}
          <div className="mt-5">
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          </div>
        </>
      )}
    </div>
  );
};

export default JobListing;
