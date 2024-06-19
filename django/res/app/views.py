from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

import logging
import json
import requests
import os


logger = logging.getLogger(__name__)



def post42(url, vars):
    url = "https://api.intra.42.fr" + url
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    response = requests.request("POST", url, headers=headers, data=vars)
    return response.json()

def get42(url, vars):
    url = "https://api.intra.42.fr" + url
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    response = requests.request("GET", url, headers=headers, data=vars)
    return response.json()

@csrf_exempt
def loginIntra(request):
    body = json.loads(request.body.decode('utf-8'))
    response = {'respuest': 'POST'}
    if request.method == "POST":
        params = {
            'grant_type': 'authorization_code',
            'client_id': os.environ['UID'],
            'client_secret': os.environ['SECRET'],
            'code': body.get('code'),
            'redirect_uri': "http://localhost:3000/",
            'state': body.get('state')
        }
        response = post42("/oauth/token", params)
    return JsonResponse(response)

def checkCred(usr, mail, pws):
    logger.info(usr)
    logger.info(mail)
    logger.info(pws)

@csrf_exempt
def enviar_mensaje(request):
    body = json.loads(request.body.decode('utf-8'))
    logger.info(body)
    if request.method == "GET":
        msg = body.get('msg')
        response = {'respuest': 'GET'}
        response['msg'] = msg
    elif request.method == "POST":
        response = {'respuest': 'POST'}
        response['usr'] = body.get('user')
        response['mail'] = body.get('mail')
        response['psw'] = body.get('psw')
        usr = body.get('user')
        mail = body.get('mail')
        psw = body.get('psw')
        checkCred(usr, mail, psw)
    return JsonResponse(response)

@csrf_exempt
def obtener_respuesta(request):
    respuesta = {'respuesta': 'Respuesta del backend'}
    return JsonResponse(respuesta)
