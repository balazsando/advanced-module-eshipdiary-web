package com.codecool.eshipdiary.controller;


import com.codecool.eshipdiary.model.User;
import com.codecool.eshipdiary.service.EmailService;
import com.codecool.eshipdiary.service.UserRepositoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.validation.Valid;
import java.util.Optional;


@Controller
public class UserController {
    private static final Logger LOG = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepositoryService userRepositoryService;

    @Autowired
    private EmailService emailService;

    @RequestMapping(value = "/users")
    public String getUserTable(Model model) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        model.addAttribute("current", userRepositoryService.getUserByUserName(userName).get().getId());
        return "users";
    }

    @RequestMapping(value = "/users/{userId}")
    public String updateUser(@PathVariable("userId") Long id, Model model){
        Optional<User> match = userRepositoryService.getUserById(id);
        model.addAttribute("user", match.isPresent() ? match.get() : new User());
        model.addAttribute("validate", "return validateForm(" + id + ")");
        return "users/user_form";
    }

    @RequestMapping(value = "/users/{userId}", method = RequestMethod.POST)
    public String saveUser(@PathVariable("userId") Long id, @ModelAttribute("user") @Valid User user, BindingResult result, Model model) {
        model.addAttribute("validate", "return validateForm(" + id + ")");
        if(userRepositoryService.getUserByUserName(user.getUserName())
                .filter(u -> !u.getId().equals(id))
                .isPresent()){
            result.addError(new FieldError(
                    "user",
                    "userName",
                    user.getUserName(),
                    true,
                    null,
                    null,
                    "A megadott felhasználónév már foglalt"));
        }
        if(userRepositoryService.getUserByEmailAddress(user.getEmailAddress())
                .filter(u -> !u.getId().equals(id))
                .isPresent()){
            result.addError(new FieldError(
                    "user",
                    "emailAddress",
                    user.getEmailAddress(),
                    true,
                    null,
                    null,
                    "A megadott email cím már foglalt"));
        }
        if(result.hasErrors()) {
            LOG.error("Error while trying to update user: " + result.getFieldErrors());
        } else {
            model.addAttribute("submit", "return submitForm(" + id + ")");
        }
        return "users/user_form";
    }
}
