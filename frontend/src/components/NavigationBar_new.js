import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, InputBase, Box, IconButton } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const greyMain = '#b0b0b0';
const greyLight = '#e0e0e0';
const greyDark = '#2c2c2c';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(greyMain, 0.15),
  '&:hover': {
    backgroundColor: alpha(greyMain, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  boxShadow: `0 0 8px ${greyMain}`,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: greyMain,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: greyMain,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '12ch',
    '&:focus': {
      width: '20ch',
      boxShadow: `0 0 12px ${greyMain}`,
    },
  },
}));

const NavLink = styled(Typography)(({ theme }) => ({
  marginRight: theme.spacing(3),
  cursor: 'pointer',
  color: greyMain,
  textShadow: `0 0 5px ${greyMain}`,
  '&:hover': {
    color: '#ffffff',
    textShadow: `0 0 10px ${greyMain}`,
  },
  fontWeight: 'bold',
  display: 'inline-block',
}));

const Logo = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  fontWeight: 'bold',
  fontSize: '1.5rem',
  color: greyMain,
  textShadow: `0 0 10px ${greyMain}`,
  cursor: 'pointer',
  userSelect: 'none',
}));

const NavigationBar = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchText.trim().toLowerCase();
    if (query === 'resume') {
      navigate('/resume');
    } else if (query === 'categories') {
      navigate('/categories');
    } else if (query === 'opportunities') {
      navigate('/opportunities/general');
    } else if (query === 'home' || query === '') {
      navigate('/');
    } else {
      // Default fallback or alert
      alert('No matching page found for your search.');
    }
    setSearchText('');
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#121212', boxShadow: `0 0 15px ${greyMain}` }}>
      <Toolbar>
        <Logo onClick={() => navigate('/')}>
          Opportunity Organiser
        </Logo>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
          <NavLink onClick={() => navigate('/')}>Home</NavLink>
          <NavLink onClick={() => navigate('/categories')}>Categories</NavLink>
          <NavLink onClick={() => navigate('/resume')}>Resume Builder</NavLink>
          <NavLink onClick={() => navigate('/opportunities/general')}>Opportunities</NavLink>
        </Box>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ ml: 2 }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Search>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
