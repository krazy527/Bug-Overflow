import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateProfile } from "../../actions/users";

const EditProfileForm = ({ currentUser, setSwitch }) => {
  const [name, setName] = useState(currentUser?.result?.name);
  const [about, setAbout] = useState(currentUser?.result?.about);
  const [tags, setTags] = useState(currentUser?.result?.tags || []);
  const dispatch = useDispatch();

  const handleTagsKeyDown = (e) => {
    // Add tag on Space, Tab, or Enter
    if (e.key === " " || e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      const currentValue = e.target.value.trim();
      if (currentValue) {
        setTags((prev) => [...prev, currentValue]);
        e.target.value = "";
      }
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (tags.length === 0) {
      alert("Update tags field");
    } else {
      dispatch(updateProfile(currentUser?.result?._id, { name, about, tags }));
    }
    setSwitch(false);
  };

  return (
    <div>
      <h1 className="edit-profile-title">Edit Your Profile</h1>
      <h2 className="edit-profile-title-2">Public information</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <label htmlFor="name">
          <h3>Display name</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label htmlFor="about">
          <h3>About me</h3>
          <textarea
            id="about"
            cols="30"
            rows="10"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          ></textarea>
        </label>
        <label htmlFor="tags">
          <h3>Watched tags</h3>
          <p>Add tags (press Space, Tab, or Enter to add)</p>
          <div className="tags-input-container">
            <input
              type="text"
              id="tags"
              onKeyDown={handleTagsKeyDown}
              placeholder="e.g. javascript react python (press Space, Tab, or Enter to add)"
            />
            {tags.length > 0 && (
              <div className="tags-display">
                {tags.map((tag, index) => (
                  <span key={index} className="tag-chip">
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        setTags((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </label>
        <br />
        <input type="submit" value="Save profile" className="user-submit-btn" />
        <button
          type="button"
          className="user-cancel-btn"
          onClick={() => setSwitch(false)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditProfileForm;
