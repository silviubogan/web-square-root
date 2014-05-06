var $input = $("#input"),
	$btn = $("#btn-ok"),
	$output = $("#output"),
	$precision = $("#precision"),
	snap = Snap("#svg");

function inversează_Array(a) {
	var b = [];
	for (var i = a.length - 1; i >= 0; i--) {
		b.push(a[i]);
	}
	return b;
}

function listă_cifre_în_număr(a) {
	var nr = 0;
	for (var i = 0; i < a.length; i++) {
		nr = nr * 10 + a[i];
	}
	return nr;
}

function afișează_grupe(grupe2, grupă_evidențiată) {
	var output = "";
	for (var i = 0; i < grupe2.length; i++) {
		var g = grupe2[i];
		var nr = listă_cifre_în_număr(g);

		if (i === grupă_evidențiată) {
			output += "<u>";
		}

		if (nr < 10 && g.length === 2) {
			output += "0";
		}
		output += nr;

		if (i === grupă_evidențiată) {
			output += "</u>";
		}

		if (i !== grupe2.length - 1) {
			output += "'";
		}
	}
	return output;
}

function număr_cifre(nr) {
	var nr_cifre = 0;
	while (nr >= 1) {
		nr_cifre++;
		nr = Math.floor(nr / 10);
	}
	return nr_cifre;
}

function vector_cifre(nr) {
	var v = [];
	while (nr >= 1) {
		v.push(nr % 10);
		nr = Math.floor(nr / 10);
	}
	return v;
}

function parte_fracționară(nr) {
	return nr - Math.floor(nr);
}

function html_în_svg(x, y, w, h, id, html) {
	var fobjectSVG = '<svg id="' + id + '"><foreignObject width="' + w + '" height="' + h + '"><body>' +
		html + '</body></foreignObject></svg>';
	var p = Snap.parse(fobjectSVG);
	snap.append(p);
	var svg2 = snap.select("#" + id);
	svg2.attr({ x: "" + x, y: "" + y });
	return svg2;
}

$input.add($precision).keyup(function (e) {
	if (e.keyCode === 13) {
		$btn.trigger("click");
	}
});

$btn.on("click", function () {
	var i;
	var s = $input.val().trim();
	if (s.length === 0) {
		alert("Trebuie să introduci un număr întreg nenegativ.");
		return;
	}
	s = s.replace(",", ".");
	var precizie_cerută = parseInt($precision.val());
	var prec = s.length - s.indexOf(".") - 1;
	var nr = parseFloat(s);
	if (nr === 0) { // caz special unde grupele nu se generează bine
		alert("Radical de ordinul 2 din 0 = 0.");
		return;
	} else if (nr < 0) {
		alert("Trebuie să introduci un număr întreg nenegativ");
		return;
	}
	var pf_orig = parte_fracționară(nr);
	var pf = parseFloat(pf_orig.toPrecision(prec));
	while (parte_fracționară(pf) !== 0) {
		pf *= 10;
		nr *= 10;
	}
	if (număr_cifre(pf) % 2 !== 0) {
		pf *= 10;
		nr *= 10;
	}
	// TODO: de suportat numere cu virgulă, cu parte fracționară
	// exemplu: 16709,1(0)
	// înainte de asta, primul caz de suportat:
	// - numere întregi care nu sunt pătrate perfecte, puse sub radical să dea #precision zecimale

	var output = "";

	var grupe = []; // de la dreapta la stânga
	var cifre = vector_cifre(nr); // de la dreapta la stânga
	for (var i = 0; i < precizie_cerută * 2 - prec; i++) {
		cifre.push(0);
	}

	var nr_cifre = număr_cifre(nr);

	var li = nr_cifre % 2 === 0 ? nr_cifre : nr_cifre - 1;
	for (i = 0; i < li; i += 2) {
		grupe.push([ cifre[i], cifre[i + 1] ]);
	}
	if (nr_cifre % 2 !== 0) {
		grupe.push([ cifre[nr_cifre - 1] ]);
	}

	var grupe2 = inversează_Array(grupe); // de la stânga la dreapta
	for (i = 0; i < grupe2.length; i++) {
		grupe2[i] = inversează_Array(grupe2[i]);
	}

	var date = { resturi_parțiale: [], câturi_duble: [],
					scăzători: [], necunoscute: [] };

	var gi = 0;
	date.prima_linie = afișează_grupe(grupe2);
	output += afișează_grupe(grupe2, gi);
	output += "<br><br>";

	var g = listă_cifre_în_număr(grupe2[gi])
	output += "Grupa " + (gi + 1) + ": " + g + "<br>";
	i = 0;
	while (i <= g) {
		if (i * i > g) {
			break;
		}
		i++;
	}
	i--;

	var ii = i * i;
	date.scăzători.push(ii);
	var dif = g - ii;
	var gi2 = gi + 1;
	output += i + "<sup>2</sup> = " + ii + " ≤ " + g + "<br>";

	output += g + " - " + ii + " = " + dif + "<br>";
	output += "Câtul pe care îl avem până acum este: <b>" + i + "</b>.<br>";
	
	var rest_parțial = dif;
	var cât = i;
	while (gi2 < grupe2.length) {
		rest_parțial = rest_parțial * 100 + listă_cifre_în_număr(grupe2[gi2]);
		date.resturi_parțiale.push(rest_parțial);
		output += "Se coboară următoarea grupă și se obține: " + rest_parțial + ".<br>";

		// nu știu care din pașii ce urmează trebuie în cazul în care gi = 1 nu există:

		var cât_dublu = cât * 2;
		date.câturi_duble.push(cât_dublu);
		output += "Se coboară câtul parțial dublat: " + cât_dublu + "_ ⋅ _. " +
			"Întrebarea va fi: _ = ? astfel încât " + cât_dublu + "_ ⋅ _ să intre maxim în " +
			rest_parțial + ".<br>"; // acel caracter este interpunct
		var j = 0;
		while (j < 10) { // cred că 9 e maximul
			if ((cât_dublu * 10 + j) * j > rest_parțial) {
				break;
			}
			j++;
		}
		j--;

		date.necunoscute.push(j);

		cât = cât * 10 + j;
		var produs = (cât_dublu * 10 + j) * j;
		date.scăzători.push(produs);
		output += cât_dublu + "<u>" + j + "</u> ⋅ <u>" + j + "</u> = " + produs + " intră maxim în " +
			rest_parțial + ". Deci se adaugă " + j + " la cât: <b>" + cât + "</b>.<br>";

		output += "Se scade " + produs + " din restul parțial " + rest_parțial +
			", se obține " + (rest_parțial - produs) + ".<br>";
		rest_parțial -= produs;
		gi2++;
	}
	date.cât_final = cât;
	output += "Câtul final este <b>" + date.cât_final + "</b>, restul final este " + rest_parțial + ".<br>";

	$output.html(output);

	// Partea grafică:

	snap.clear();
	snap.polyline(20, 20,
		30, 20,
		35, 40,
		40, 0,
		175, 0,
		175, 40,
			275, 40,
		175, 40,
		175, 150).attr({ stroke: "black", fill: "transparent" });

	var s1 = date.prima_linie + "<br>";
	for (i = 0; i < date.resturi_parțiale.length; i++) {
		s1 += date.scăzători[i] + "<hr>";
		s1 += date.resturi_parțiale[i] + "<br>";
	}

	var s2 = "";
	for (i = 0; i < date.câturi_duble.length; i++) {
		s2 += date.câturi_duble[i] + "<u>" + date.necunoscute[i] +
			"</u> ⋅ <u>" + date.necunoscute[i] + "</u><hr>";
	}

	var svg2 = html_în_svg(50, 10, 100, 100, "svg2", s1);
	var svg3 = html_în_svg(185, 10, 100, 100, "svg3", date.cât_final);
	var svg4 = html_în_svg(185, 50, 90, 100, "svg4", s2);
});