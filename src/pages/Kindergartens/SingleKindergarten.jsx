import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import Swal from "sweetalert2";

const SingleKindergarten = ({ location }) => {
  const { user } = useAuth(); // Get the user from your authentication context
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `https://edu-map-chemnitz-server.vercel.app/user/favorite/${user?.email}`
          );
          const favorites = response.data;

          // Check if the current location is already in the user's favorites
          const alreadyFavorite = favorites.some(
            (fav) =>
              (fav.location.id || fav.location._id) ===
                (location.id || location?._id) &&
              fav.location?.category === "Kindergarten"
          );
          setIsFavorite(alreadyFavorite);
        } catch (error) {
          console.error("Error fetching favorites:", error);
        } finally {
          setLoading(false); // Set loading to false after the check
        }
      } else {
        setLoading(false); // Set loading to false if no user is logged in
      }
    };

    checkIfFavorite();
  }, [user, location.id || location?._id]);

  const handleAddToFavorite = async () => {
    if (!user) {
      // If the user is not logged in, redirect to login or show a message
      alert("You must be logged in to add to favorites.");
      return navigate("/login");
    }

    try {
      const favoriteData = {
        userEmail: user?.email,
        location: {
          id: location.id || location?._id,
          name: location.properties.BEZEICHNUNG,
          url: `kindergarten/${location?.id || location?._id}`,
          category: "Kindergarten",
        },
      };

      const response = await axios.post(
        "https://edu-map-chemnitz-server.vercel.app/user/favorite",
        favoriteData
      );

      if (response?.data?.status === "success") {
        setIsFavorite(true);
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your location has been added to your favorite list",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      console.log(response.data);
    } catch (error) {
      console.error("Error adding to favorite:", error);
    }
  };

  return (
    <div className="card w-80 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{location?.properties?.BEZEICHNUNG}</h2>
        <p className="text-sm  font-mono">(Kindergarten)</p>
        <div className="card-actions justify-end">
          <Link to={`/kindergarten/${location.id || location?._id}`}>
            <button className="btn btn-primary">View Details</button>
          </Link>
          <button
            onClick={handleAddToFavorite}
            disabled={isFavorite || loading} // Disable button during loading or if already favorite
            className="btn btn-secondary"
          >
            {loading
              ? "Loading..."
              : isFavorite
              ? "Already Added"
              : "Add To Favorite"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleKindergarten;
