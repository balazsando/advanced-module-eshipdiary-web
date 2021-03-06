package com.codecool.eshipdiary.service;

import com.codecool.eshipdiary.security.TenantAwarePrincipal;
import com.codecool.eshipdiary.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private static final Logger LOG = LoggerFactory.getLogger(UserDetailsServiceImpl.class);


    @Autowired
    private UserRepositoryService userRepositoryService;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user = userRepositoryService.getUserByUserName(username);
        LOG.info("User for authentication by name {} ", user.get().getUserName());

        Set<GrantedAuthority> grantedAuthorities = new HashSet<>();
        grantedAuthorities.add(new SimpleGrantedAuthority(user.get().getRole().getName()));
        LOG.info("User for authentication with authorities {} ", grantedAuthorities);


        return new TenantAwarePrincipal(
                user.get().getUserName(),
                user.get().getPasswordHash(),
                user.get().isActive(),
                true,
                true,
                true,
                grantedAuthorities,
                user.get().getClub()
        );
    }
}
