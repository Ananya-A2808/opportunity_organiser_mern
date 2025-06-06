import React from 'react';
import { AppBar, Toolbar, Typography, InputBase, Box, IconButton } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha('#00ffff', 0.15),
  '&:hover': {
    backgroundColor: alpha('#00ffff', 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  boxShadow: '0 0 8px #00ffff',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#00ffff',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#00ffff',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '12ch',
    '&:focus': {
      width: '20ch',
      boxShadow: '0 0 12px #00ffff',
    },
  },
}));

const NavLink = styled(Typography)(({ theme }) => ({
  marginRight: theme.spacing(3),
  cursor: 'pointer',
  color: '#00ffff',
  textShadow: '0 0 5px #00ffff',
  '&:hover': {
    color: '#ffffff',
    textShadow: '0 0 10px #00ffff',
  },
  fontWeight: 'bold',
}));

const Logo = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  fontWeight: 'bold',
  fontSize: '1.5rem',
  color: '#00ffff',
  textShadow: '0 0 10px #00ffff',
  cursor: 'pointer',
}));

const NavigationBar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#121212', boxShadow: '0 0 15px #00ffff' }}>
      <Toolbar>
        <Logo onClick={() => navigate('/')}>
          NeonMail
        </Logo>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <NavLink onClick={() => navigate('/')}>Home</NavLink>
          <NavLink onClick={() => navigate('/categories')}>Categories</NavLink>
          <NavLink onClick={() => navigate('/resume')}>Resume Builder</NavLink>
          <NavLink onClick={() => navigate('/opportunities/general')}>Opportunities</NavLink>
        </Box>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
