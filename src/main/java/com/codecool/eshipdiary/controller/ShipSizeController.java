package com.codecool.eshipdiary.controller;

import com.codecool.eshipdiary.model.ShipSize;
import com.codecool.eshipdiary.service.ShipSizeRepositoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.Optional;

@Controller
public class ShipSizeController {
    private static final Logger LOG = LoggerFactory.getLogger(ShipSizeController.class);


    @Autowired
    ShipSizeRepositoryService shipSizeRepositoryService;

    @RequestMapping(value = {"/shipsizes", "/shipsizes/**"})
    public String getShipSizeTable(Model model) {
        model.addAttribute("shipSize");
        return "shipsizes";
    }

    @RequestMapping(value = "/shipsizes/update/{shipSizesId}", method = RequestMethod.OPTIONS)
    public String updateShipSize(@PathVariable("shipSizesId") Long id, Model model){
        Optional<ShipSize> shipSize = shipSizeRepositoryService.getShipSizeById(id);
        model.addAttribute("shipSize", shipSize.isPresent() ? shipSize.get() : new ShipSize());
        model.addAttribute("validate", "return validateShipSize()");
        return "shipsizes/shipsize_form";
    }

    @RequestMapping(value = "/shipsizes/update", method = RequestMethod.POST)
    public String saveShipSize(@ModelAttribute("shipSize") @Valid ShipSize shipSize, BindingResult result, Model model) {
        model.addAttribute("validate", "return validateShipSize()");
        if(result.hasErrors()) {
            LOG.error("Error while trying to update shipSize: " + result.getFieldErrors());
        } else {
            model.addAttribute("submit", "return submitShipSize()");
            shipSizeRepositoryService.save(shipSize);
        }
        return "shipsizes/shipsize_form";
    }

    @RequestMapping(value = "/shipsizes/delete/{shipSizesId}")
    public void deleteShipSize(@PathVariable("shipSizesId") Long id, HttpServletResponse response){
        shipSizeRepositoryService.deleteShipSizeById(id);
        response.setStatus(200);
    }


}
