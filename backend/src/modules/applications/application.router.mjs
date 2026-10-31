import {Router} from 'express';
import {idValue,enums} from '../../validation.mjs';
import {applicationService} from './application.service.mjs';
export const createApplicationRouter=({authenticate,role,asyncHandler,send,fail,service=applicationService})=>{
  const router=Router();
  router.get('/applications',authenticate,asyncHandler(async(req,res)=>send(res,200,await service.list(req.user))));
  router.get('/notifications',authenticate,role('user'),asyncHandler(async(req,res)=>send(res,200,await service.notifications(req.user.id))));
  router.post('/applications',authenticate,role('user'),asyncHandler(async(req,res)=>{
    const animalId=idValue(req.body?.animalId),motivation=req.body?.motivation;
    if(!animalId||typeof motivation!=='string'||motivation.trim().length<10||motivation.length>3000)
      return fail(res,400,'VALIDATION_ERROR','Animal y motivación de al menos 10 caracteres requeridos');
    send(res,201,await service.create({animalId,userId:req.user.id,motivation}));
  }));
  router.get('/applications/:id',authenticate,asyncHandler(async(req,res)=>{
    const id=idValue(req.params.id);
    if(!id)return fail(res,400,'VALIDATION_ERROR','ID inválido');
    send(res,200,await service.detail(id,req.user));
  }));
  router.patch('/applications/:id/status',authenticate,role('admin'),asyncHandler(async(req,res)=>{
    const id=idValue(req.params.id),status=req.body?.status,reason=req.body?.reason||'';
    if(!id||!enums.applicationStatus.includes(status)||typeof reason!=='string'||reason.length>1000)
      return fail(res,400,'VALIDATION_ERROR','Estado o motivo inválido');
    send(res,200,await service.changeStatus({id,status,reason,actorId:req.user.id}));
  }));
  return router;
};
